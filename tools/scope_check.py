#!/usr/bin/env python3
"""Detecta usos de helpers locales fuera del scope que los declara.

El pase responsive envolvió grillas en `gcol(...)` en TODO el archivo, pero
inyectó `const gcol = useGridCols();` sólo en el componente de página. Los
subcomponentes del mismo archivo (Milestone en empresa.jsx, etc.) quedaron
usando un identificador que no existe -> ReferenceError en render.

Los archivos son planos: funciones de nivel superior `function X() {...}`.
Se segmenta por esas fronteras y se verifica declaración vs uso en cada una.
`fluid`, `useBreakpoint`, `useResponsivePad` y `useGridCols` son globales de
shared.jsx, así que no entran acá — sólo los `const` locales.
"""
import re
from pathlib import Path

ROOT = Path("/home/bmoreira/LLM-devs/Andes/webpage/claude-design-final/v1-original")
LOCALS = ["gcol", "isMobile", "isTablet", "pad", "rpad"]

TOP_FN = re.compile(r"^(?:function|const)\s+([A-Za-z0-9_$]+)", re.M)

problems = []
for path in sorted(ROOT.glob("*.jsx")):
    lines = path.read_text(encoding="utf-8").split("\n")

    # fronteras de funciones de nivel superior
    bounds = [(i, m.group(1)) for i, ln in enumerate(lines)
              if (m := TOP_FN.match(ln))]
    bounds.append((len(lines), "<eof>"))

    for idx in range(len(bounds) - 1):
        start, name = bounds[idx]
        end = bounds[idx + 1][0]
        body = "\n".join(lines[start:end])

        for local in LOCALS:
            uses = re.findall(rf"(?<![\w.]){local}\b", body)
            if not uses:
                continue
            declared = re.search(
                rf"(?:const|let|var)\s+(?:\{{[^}}]*\b{local}\b[^}}]*\}}|{local}\b)", body
            ) or re.search(rf"\b{local}\s*[,}}]?\s*=\s*", body.split("=>")[0] if "=>" in body else "")
            # también cuenta como declarado si viene por parámetro/destructuring de props
            param_decl = re.search(rf"function\s+{re.escape(name)}\s*\([^)]*\b{local}\b", body) \
                or re.search(rf"\{{[^}}]*\b{local}\b[^}}]*\}}\s*(?:=[^)]*)?\)\s*\{{", body[:400])
            if not declared and not param_decl:
                first = start + next(
                    i for i, ln in enumerate(lines[start:end])
                    if re.search(rf"(?<![\w.]){local}\b", ln)
                ) + 1
                problems.append((path.name, name, local, first))

if problems:
    print(f"{len(problems)} uso(s) fuera de scope:\n")
    for f, fn, local, line in problems:
        print(f"  {f}:{line}  función {fn}()  usa `{local}` sin declararlo")
else:
    print("sin usos fuera de scope")
