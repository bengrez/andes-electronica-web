#!/usr/bin/env python3
"""Especies del mapa de inicio (2026-11-03, «Diseño e investigación»): convierte la lista curada de A10 (handoff 019,
~/LLM-devs/Andes/especies-h25/registros-curados.json) en datos/especies-h25.js, sin datos personales más que lo que
iNaturalist publica (id de la observación, fecha). Sólo registros con coordenadas abiertas (la lista ya los filtra; aquí
se vuelve a comprobar). Decisiones de Benjamin (3-nov): entran todas, exóticas incluidas; las 35 de «especies» llevan
ficha y las 51 de «exoticas_otras» van sólo como puntos.
Uso: python3 scripts/importar_especies.py [ruta del json]"""
import json, os, sys

FUENTE = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/LLM-devs/Andes/especies-h25/registros-curados.json')
SALIDA = os.path.join(os.path.dirname(__file__), '..', 'datos', 'especies-h25.js')
d = json.load(open(FUENTE))
if 'ninguno oscurecido' not in str(d['meta'].get('coordenadas', '')):
    sys.exit('la lista no declara coordenadas abiertas: revisar antes de importar')

def regs(e):
    out = []
    for r in e['registros']:
        if r.get('oscurecida') or r.get('geoprivacy') not in (None, 'open'):
            continue
        out.append([round(r['x']), round(r['z']), r['fecha'], r['id']])
    return out

especies = []
for e in d['especies']:
    especies.append({'c': e['clave'], 'n': e['nombre_comun'], 's': e['nombre_cientifico'], 'g': e['grupo'],
                     'o': e['origen'], 'i': 1 if e.get('introducida') else 0, 'f': 1, 'r': regs(e)})
for e in d['exoticas_otras']:
    especies.append({'c': '', 'n': e['nombre_comun'], 's': e['nombre_cientifico'], 'g': e['grupo'],
                     'o': e['origen'], 'i': 1, 'f': 0, 'r': regs(e)})
n = sum(len(e['r']) for e in especies)
cab = ('/* Especies de la ruta H-25 para el mapa de inicio. Generado por scripts/importar_especies.py desde la lista curada '
       'de A10 (handoff 019), ' + d['meta']['generado'][:10] + '. Registros de iNaturalist con coordenadas abiertas '
       '(c: clave de la silueta, n: nombre común, s: científico, g: grupo, o: origen, i: introducida, f: lleva ficha, '
       'r: [x, z, fecha, id de observación] en metros del cuadro; https://www.inaturalist.org/observations/<id>). '
       + str(len(especies)) + ' especies, ' + str(n) + ' registros. */\n')
open(SALIDA, 'w').write(cab + 'window.ESPECIES_H25 = ' + json.dumps({'especies': especies}, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(especies), 'especies,', n, 'registros →', os.path.normpath(SALIDA))
