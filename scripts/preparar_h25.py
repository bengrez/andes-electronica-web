"""Prepara `datos/h25.js` (ruta y relieve de la portada) a partir de los archivos de Link+.

    python3 scripts/preparar_h25.py ~/LLM-devs/Andes/link_plus

Entradas (sólo datos públicos):
  - staging/rutas/ruta_h25_sewell.geojson: trazado de la ruta y límites de velocidad por tramo, de OpenStreetMap (ODbL).
  - frontend/public/curvas_h25.geojson: curvas de nivel cada 100 m, de Terrain Tiles (Mapzen, AWS Open Data).
No se usan `ruta_h25_sewell.perfil.json` ni `flota_h25.json`: derivan de posiciones reales de un cliente.

  - Modelo de elevación: Terrain Tiles «terrarium» (Mapzen, AWS Open Data; SRTM y otros), zoom 13. Se descargan una vez y
    quedan en ~/.cache/andes-relieve/.

Salida: coordenadas en metros sobre un plano local (x hacia el este, y hacia el sur), simplificadas y sin nombres de vías.
  - datos/h25.js: ruta (con la altitud de cada punto), límites, curvas de nivel y capas de la cordillera vista desde el sur.
  - img/relieve-noche.webp e img/relieve-dia.webp: relieve sombreado del mismo cuadro (vista 2D, respaldo).
  - img/relieve-3d-noche.webp, img/relieve-3d-dia.webp e img/alturas-3d.png: texturas (tema oscuro y claro) y alturas
    (R·256 + G, en metros) de un área mayor, para la vista 3D.
La salida es idéntica en cada corrida.
"""

import json
import math
import sys
import urllib.request
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image

TOL_RUTA = 5.0      # m, tolerancia de simplificación
TOL_CURVA = 55.0
MARGEN = 0.18      # el cuadro del relieve: el de la ruta más un 18 % por lado
MIN_LARGO = 900.0  # m, se descartan los trozos de curva más cortos
ZOOM = 13
CACHE = Path.home() / ".cache/andes-relieve"
URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
ANCHO_IMG = 1600   # px del relieve sombreado
PASO_PERFIL = 100.0                      # m entre muestras del perfil del camino
CORTES = [1200, 3000, 6000, 10500]       # m al norte del camino: cortes paralelos que se ven detrás de él
EXT_3D = 9000.0                          # m de terreno alrededor del cuadro en la vista 3D
PASO_3D = 200.0                          # m entre vértices de la malla 3D
ANCHO_TEX_3D = 2048                      # px de la textura 3D
SOL = {"azimut": 75.0, "altura": 24.0}   # tema claro: sol bajo hacia el este-noreste, detrás de la cordillera


class Elevacion:
    """Mosaico de Terrain Tiles con lectura bilineal en (lon, lat)."""

    def __init__(self, lon_min, lat_min, lon_max, lat_max):
        x0, y0 = self._tile(lon_min, lat_max)
        x1, y1 = self._tile(lon_max, lat_min)
        self.x0, self.y0 = int(x0), int(y0)
        filas = []
        for ty in range(int(y0), int(y1) + 1):
            filas.append(np.hstack([self._baja(tx, ty) for tx in range(int(x0), int(x1) + 1)]))
        self.m = np.vstack(filas)

    @staticmethod
    def _tile(lon, lat):
        n = 2 ** ZOOM
        return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n

    def _baja(self, tx, ty):
        ruta = CACHE / f"{ZOOM}-{tx}-{ty}.png"
        if not ruta.exists():
            CACHE.mkdir(parents=True, exist_ok=True)
            ruta.write_bytes(urllib.request.urlopen(URL.format(z=ZOOM, x=tx, y=ty), timeout=30).read())
        a = np.asarray(Image.open(BytesIO(ruta.read_bytes())).convert("RGB"), dtype=np.float64)
        return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768

    def en(self, lon, lat):
        lon, lat = np.asarray(lon, dtype=np.float64), np.asarray(lat, dtype=np.float64)
        n = 2 ** ZOOM
        px = ((lon + 180) / 360 * n - self.x0) * 256
        py = ((1 - np.arcsinh(np.tan(np.radians(lat))) / np.pi) / 2 * n - self.y0) * 256
        i0, j0 = np.floor(py).astype(int), np.floor(px).astype(int)
        fy, fx = py - i0, px - j0
        i0 = np.clip(i0, 0, self.m.shape[0] - 2); j0 = np.clip(j0, 0, self.m.shape[1] - 2)
        m = self.m
        return ((m[i0, j0] * (1 - fx) + m[i0, j0 + 1] * fx) * (1 - fy) + (m[i0 + 1, j0] * (1 - fx) + m[i0 + 1, j0 + 1] * fx) * fy)


def sombreado(z, paso, azimut=315.0, altura=38.0, exagera=1.6):
    gy, gx = np.gradient(z * exagera, paso)
    pend = np.arctan(np.hypot(gx, gy))
    asp = np.arctan2(-gx, gy)
    az, al = math.radians(360 - azimut + 90), math.radians(altura)
    return np.clip(np.sin(al) * np.cos(pend) + np.cos(al) * np.sin(pend) * np.cos(az - asp), 0, 1)


# tema claro: colores de la zona central de Chile según la altitud (valle, matorral, roca, nieve)
COLOR_DIA = [(400, (128, 138, 92)), (900, (146, 140, 100)), (1500, (152, 130, 98)), (2200, (142, 134, 124)),
             (2900, (168, 162, 156)), (3250, (176, 172, 170)), (3550, (238, 240, 246))]


def relieve_noche(z, sh):
    """Tema oscuro: el paisaje de día bajo la luna. Los mismos colores por altitud, apagados y teñidos de azul,
    con la luz de luna desde el noroeste; la nieve queda azulada y algo más clara."""
    alt = [a for a, _ in COLOR_DIA]
    base = np.stack([np.interp(z, alt, [c[i] for _, c in COLOR_DIA]) for i in range(3)], axis=-1)
    gris = base.mean(axis=-1, keepdims=True)
    base = base * 0.78 + gris * 0.22                    # algo menos saturado
    tinte = np.array([0.62, 0.72, 1.0])                 # luz de luna
    luz = (0.18 + 0.62 * sh)[..., None]
    return np.clip(base * tinte * luz, 0, 255).astype(np.uint8)


def relieve_dia(z, sh):
    """Tema claro: de día, con el sol bajo hacia el este (todavía detrás de la cordillera)."""
    alt = [a for a, _ in COLOR_DIA]
    base = np.stack([np.interp(z, alt, [c[i] for _, c in COLOR_DIA]) for i in range(3)], axis=-1)
    luz = (0.42 + 0.78 * sh)[..., None]
    sombra = np.array([0.92, 0.95, 1.06])           # las sombras tiran apenas al azul del cielo
    c = base * luz * (sombra * (1 - sh[..., None]) + sh[..., None])
    return np.clip(c, 0, 255).astype(np.uint8)


def proyectar(pts, lon0, lat0, coslat):
    return [((lon - lon0) * coslat * 111320.0, (lat0 - lat) * 110574.0) for lon, lat, *_ in pts]


def dp(pts, tol):
    """Douglas-Peucker iterativo."""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    pila = [(0, len(pts) - 1)]
    while pila:
        a, b = pila.pop()
        (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2 - x1, y2 - y1
        n = math.hypot(dx, dy) or 1e-9
        mejor, idx = 0.0, -1
        for i in range(a + 1, b):
            d = abs(dy * (pts[i][0] - x1) - dx * (pts[i][1] - y1)) / n
            if d > mejor:
                mejor, idx = d, i
        if mejor > tol:
            keep[idx] = True
            pila += [(a, idx), (idx, b)]
    return [p for p, k in zip(pts, keep) if k]


def main(raiz: Path) -> None:
    ruta = json.loads((raiz / "staging/rutas/ruta_h25_sewell.geojson").read_text())
    curvas = json.loads((raiz / "frontend/public/curvas_h25.geojson").read_text())
    coords = ruta["geometry"]["coordinates"]
    lons = [c[0] for c in coords]
    lats = [c[1] for c in coords]
    lon0, lat0 = min(lons), max(lats)
    coslat = math.cos(math.radians((min(lats) + max(lats)) / 2))
    pr = dp(proyectar(coords, lon0, lat0, coslat), TOL_RUTA)
    # cuadro: el de la ruta con margen; el origen pasa a su esquina superior izquierda
    xs, ys = [p[0] for p in pr], [p[1] for p in pr]
    mx, my = (max(xs) - min(xs)) * MARGEN, (max(ys) - min(ys)) * MARGEN
    ox, oy = min(xs) - mx, min(ys) - my
    ancho, alto = max(xs) + mx - ox, max(ys) + my - oy
    pr = [(x - ox, y - oy) for x, y in pr]
    a_lon = lambda x: lon0 + (x + ox) / (coslat * 111320.0)
    a_lat = lambda y: lat0 - (y + oy) / 110574.0
    M = CORTES[-1] + 1500
    dem = Elevacion(a_lon(-M), a_lat(alto + M), a_lon(ancho + M), a_lat(-M))
    # relieve sombreado del cuadro
    paso_img = ancho / ANCHO_IMG
    alto_img = round(alto / paso_img)
    gx, gy = np.meshgrid((np.arange(ANCHO_IMG) + 0.5) * paso_img, (np.arange(alto_img) + 0.5) * paso_img)
    z = dem.en(a_lon(gx), a_lat(gy))
    raiz_sitio = Path(__file__).resolve().parent.parent
    Image.fromarray(relieve_noche(z, sombreado(z, paso_img))).save(raiz_sitio / "img/relieve-noche.webp", "WEBP", quality=72, method=6)
    Image.fromarray(relieve_dia(z, sombreado(z, paso_img, **SOL))).save(raiz_sitio / "img/relieve-dia.webp", "WEBP", quality=58, method=6)
    # perfil del camino desarrollado y, por cada punto, la cumbre más alta en anillos cada vez más lejanos
    d_r = [0.0]
    for i in range(1, len(pr)):
        d_r.append(d_r[-1] + math.dist(pr[i - 1], pr[i]))
    ds = np.arange(0, d_r[-1], PASO_PERFIL)
    px = np.interp(ds, d_r, [p[0] for p in pr]); py = np.interp(ds, d_r, [p[1] for p in pr])
    perfil_ruta = dem.en(a_lon(px), a_lat(py))
    # cada corte sigue al camino desplazado hacia el norte: así la silueta tiene las cumbres y quebradas reales
    suave = lambda v, n: np.convolve(np.pad(v, n // 2, mode="edge"), np.ones(n) / n, mode="valid")
    pyl = suave(py, 31)   # el desplazamiento parte de un trazado suavizado, para que el corte no copie las curvas
    cortes = [[d, [int(round(v)) for v in suave(dem.en(a_lon(px), a_lat(pyl - d)), 3)]] for d in CORTES]
    perfil = {"paso": PASO_PERFIL, "ruta": [int(round(v)) for v in suave(perfil_ruta, 9)], "cortes": cortes}
    # vista 3D: alturas en una rejilla gruesa (PNG sin pérdida) y textura sombreada de un área mayor
    ax3, az3 = ancho + 2 * EXT_3D, alto + 2 * EXT_3D
    nx3, nz3 = int(math.ceil(ax3 / PASO_3D)) + 1, int(math.ceil(az3 / PASO_3D)) + 1
    gx3, gz3 = np.meshgrid(-EXT_3D + np.arange(nx3) * PASO_3D, -EXT_3D + np.arange(nz3) * PASO_3D)
    alt3 = np.clip(np.round(dem.en(a_lon(gx3), a_lat(gz3))), 0, 65535).astype(np.uint16)
    png = np.zeros((nz3, nx3, 3), dtype=np.uint8); png[..., 0] = alt3 >> 8; png[..., 1] = alt3 & 255
    Image.fromarray(png).save(raiz_sitio / "img/alturas-3d.png", optimize=True)
    paso_t = ax3 / ANCHO_TEX_3D
    alto_t = round(az3 / paso_t)
    tx, tz = np.meshgrid(-EXT_3D + (np.arange(ANCHO_TEX_3D) + 0.5) * paso_t, -EXT_3D + (np.arange(alto_t) + 0.5) * paso_t)
    zt = dem.en(a_lon(tx), a_lat(tz))
    Image.fromarray(relieve_noche(zt, sombreado(zt, paso_t))).save(raiz_sitio / "img/relieve-3d-noche.webp", "WEBP", quality=62, method=6)
    Image.fromarray(relieve_dia(zt, sombreado(zt, paso_t, **SOL))).save(raiz_sitio / "img/relieve-3d-dia.webp", "WEBP", quality=58, method=6)
    tres_d = {"x0": -EXT_3D, "z0": -EXT_3D, "ancho": round(ax3), "alto": round(az3), "nx": nx3, "nz": nz3, "paso": PASO_3D}
    elev_ruta = [int(round(v)) for v in dem.en(a_lon(np.array([p[0] for p in pr])), a_lat(np.array([p[1] for p in pr])))]
    salida = {
        "ancho": round(ancho),
        "alto": round(alto),
        "ruta": [[round(x), round(y)] for x, y in pr],
        "limites": [[int(d), int(v)] for d, v in ruta["properties"]["limites_kmh"]],  # [desde_m, km/h]
        "largo": int(ruta["properties"]["largo_m"]),
        "curvas": [],
        "elev_ruta": elev_ruta,
        "perfil": perfil,
        "tres_d": tres_d,
    }
    dentro = lambda q: 0 <= q[0] <= ancho and 0 <= q[1] <= alto
    for f in curvas["features"]:
        p = [(x - ox, y - oy) for x, y in proyectar(f["geometry"]["coordinates"], lon0, lat0, coslat)]
        # se parte la curva en tramos dentro del cuadro (con un punto de sobra a cada lado)
        tramos, actual = [], []
        for i, q in enumerate(p):
            if dentro(q) or (i + 1 < len(p) and dentro(p[i + 1])) or (i > 0 and dentro(p[i - 1])):
                actual.append(q)
            elif actual:
                tramos.append(actual); actual = []
        if actual:
            tramos.append(actual)
        for tr in tramos:
            largo = sum(math.dist(tr[i], tr[i + 1]) for i in range(len(tr) - 1))
            tr = dp(tr, TOL_CURVA)
            if len(tr) >= 2 and largo >= MIN_LARGO:
                salida["curvas"].append([f["properties"]["elev"], [v for x, y in tr for v in (round(x), round(y))]])
    texto = ("/* Generado por scripts/preparar_h25.py; no editar a mano.\n"
             "   Ruta: © colaboradores de OpenStreetMap (ODbL). Relieve: Terrain Tiles (Mapzen, AWS Open Data). */\n"
             "window.H25 = " + json.dumps(salida, separators=(",", ":")) + ";\n")
    destino = raiz_sitio / "datos/h25.js"
    destino.write_text(texto)
    print(f"{destino}: {len(texto) / 1024:.1f} KB, ruta {len(pr)} puntos, {len(salida['curvas'])} curvas, "
          f"{sum(len(c[1]) // 2 for c in salida['curvas'])} puntos de relieve, {salida['ancho']}×{salida['alto']} m; "
          f"altitud de la ruta {min(elev_ruta)}–{max(elev_ruta)} m, cuadro {int(z.min())}–{int(z.max())} m; "
          f"cortes: {[max(c[1]) for c in perfil['cortes']]} m; relieve {ANCHO_IMG}×{alto_img} px, {(raiz_sitio / 'img/relieve-noche.webp').stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main(Path(sys.argv[1]).expanduser())
