#!/usr/bin/env python3
"""Especies del mapa de inicio (2026-11-03, «Diseño e investigación»): convierte la lista curada de A10 (handoff 019,
~/LLM-devs/Andes/especies-h25/registros-curados.json) en datos/especies-h25.js, sin datos personales más que lo que
iNaturalist publica (id de la observación, fecha). Sólo registros con coordenadas abiertas (la lista ya los filtra; aquí
se vuelve a comprobar). Decisiones de Benjamin (24-nov, cambian las del 3-nov): exóticas fuera del todo; 26 nativas de
iNaturalist y 4 aves nativas que suma GBIF (loica, diucón, bandurria, torcaza): 30 especies, todas con rótulo. Los
registros de GBIF (sólo conjuntos CC BY o CC0, sin las copias de iNaturalist) llevan el nombre corto de su conjunto
(eBird, CAPES, un herbario) y cuántos registros se juntaron en ese punto.
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
        if r['fuente'] == 'gbif':
            if not any(l in r['licencia'] for l in ('licenses/by/4.0', 'publicdomain/zero/1.0')):
                sys.exit('registro de GBIF sin licencia CC BY o CC0: ' + str(r['id']))
            out.append([round(r['x']), round(r['z']), r['fecha'] or '', r['id'], round(r['lat'], 5), round(r['lon'], 5), r['fuente_corta'], r.get('n_en_el_punto', 1)])
        else:
            out.append([round(r['x']), round(r['z']), r['fecha'], r['id'], round(r['lat'], 5), round(r['lon'], 5)])
    return out

# modelo de hábitat (Benjamin, 3-nov): altura de los registros y pesos de exposición, para repartir las plantas modeladas
CLAVES_HAB = {'solana': 's', 'umbría': 'u', 'río/quebrada': 'q', 'plano/fondo de valle': 'p', 'alta montaña': 'm'}
def habitat(txt):
    out = {}
    for parte in (txt or '').split(';'):
        parte = parte.strip()
        if not parte: continue
        nombre, _, n = parte.rpartition(' ')
        if nombre in CLAVES_HAB: out[CLAVES_HAB[nombre]] = int(n)
    return out

# línea de conservación del rótulo, sólo si la especie está amenazada en el RCE (NT, VU, EN, CR). El tricahue tiene
# categoría por regiones: en O'Higgins (VI, dentro de «V-RM-XII») es VU, como dice su ficha (informe.md)
CATEGORIAS = {'NT': 'Casi amenazada', 'VU': 'Vulnerable', 'EN': 'En peligro', 'CR': 'En peligro crítico'}
REGIONAL = {'tricahue': 'VU'}
def conservacion(e):
    cat = REGIONAL.get(e['clave']) or (e.get('rce') or '').strip()[:2]
    return cat + ' · ' + CATEGORIAS[cat] + ' (RCE)' if cat in CATEGORIAS else ''

especies = []
for e in d['especies']:
    x = {'c': e['clave'], 'n': e['nombre_comun'], 's': e['nombre_cientifico'], 'g': e['grupo'],
         'o': e['origen'], 'i': 1 if e.get('introducida') else 0, 'f': 1, 'r': regs(e)}
    if e.get('altitud_registros_m'): x['a'] = e['altitud_registros_m']
    if habitat(e.get('habitat')): x['h'] = habitat(e.get('habitat'))
    if conservacion(e): x['rce'] = conservacion(e)
    especies.append(x)
if any(e.get('introducida') or e['origen'] == 'exótica' for e in d['especies']) or d.get('exoticas_otras'):
    sys.exit('la lista trae exóticas: Benjamin las dejó fuera (24-nov)')
for e in d.get('exoticas_otras', []):
    especies.append({'c': '', 'n': e['nombre_comun'], 's': e['nombre_cientifico'], 'g': e['grupo'],
                     'o': e['origen'], 'i': 1, 'f': 0, 'r': regs(e)})
n = sum(len(e['r']) for e in especies); nr = sum(r[7] if len(r) > 6 else 1 for e in especies for r in e['r'])
cab = ('/* Especies de la ruta H-25 para el mapa de inicio. Generado por scripts/importar_especies.py desde la lista curada '
       '(handoff 019 y 021), ' + d['meta']['generado'][:10] + '. Registros con coordenadas abiertas de iNaturalist y de GBIF '
       '(c: clave de la silueta, n: nombre común, s: científico, g: grupo, o: origen, i: introducida, f: lleva ficha, '
       'r: [x, z, fecha, id, lat, lon] de iNaturalist (https://www.inaturalist.org/observations/<id>) o '
       '[x, z, fecha, id, lat, lon, conjunto, n] de GBIF (https://www.gbif.org/occurrence/<id>; n: registros juntados en ese punto); '
       'x, z en metros del cuadro; lat, lon WGS84). GBIF: sólo conjuntos CC BY 4.0 o CC0 (eBird, doi:10.15468/aomfnb; '
       'CAPES, doi:10.15468/6rb3d3 y 10.15468/7bgr64; Pl@ntNet, doi:10.15468/gtebaa; herbarios VALPL, E, MU y Naturalis). '
       + str(len(especies)) + ' especies, ' + str(nr) + ' registros en ' + str(n) + ' puntos. */\n')
open(SALIDA, 'w').write(cab + 'window.ESPECIES_H25 = ' + json.dumps({'especies': especies}, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(especies), 'especies,', nr, 'registros en', n, 'puntos →', os.path.normpath(SALIDA))
