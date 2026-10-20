"""Trace the collision map for the playable castle from cosmicdroid's drawing.

    python3 tools/castle_trace.py path/to/castle.png [--check overlay.png]

Reads the drawing (transparent sky), crops it to the castle, and prints the MAP
rows for site/js/castle.js (5 px tiles, 360 px wide world):
  '#'  stone   = large areas of the wall lavender (#b5a9ff), bricks included
  '='  plank   = the brown wooden planks (#af7f29); little gaps between a plank and the wall are closed
  ' '  open    = rooms, furniture, sky
It also saves the cropped drawing to site/assets/castle/castle.webp.
After running it: paste MAP into castle.js, and check CASTLE_ART.castleBox,
ROOMS, CASTLE_SPOTS, BED, SPIKES and HAZARDS still match the drawing.
"""
import sys, os, json, argparse
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("--check", help="save a picture of the map over the drawing")
a = ap.parse_args()
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")

im = Image.open(a.src).convert("RGBA")
im = im.crop(im.getchannel("A").getbbox())
im.save(os.path.join(ROOT, "assets", "castle", "castle.webp"), "WEBP", quality=88, method=6)
A = np.array(im).astype(int); R, G, B, AL = A[..., 0], A[..., 1], A[..., 2], A[..., 3]
s = 360 / im.width

lav = (AL > 200) & (abs(R - 181) < 38) & (abs(G - 169) < 38) & (abs(B - 255) < 30)
brick = (AL > 200) & (B > 200) & (R < 150) & (G > 90) & (G < 170)
lab, n = ndimage.label(lav | brick)
sizes = ndimage.sum(lav | brick, lab, range(1, n + 1))
wall = np.isin(lab, [i + 1 for i, v in enumerate(sizes) if v > 25000])   # furniture is smaller than this
wall = ndimage.binary_closing(wall, iterations=4)
cob = (AL > 200) & (B > 200) & (R < 110) & (G < 60)            # dark outline next to stone counts as stone
wall = wall | (ndimage.binary_dilation(wall, iterations=6) & cob)
holes, nh = ndimage.label(~wall)
for i, v in enumerate(ndimage.sum(~wall, holes, range(1, nh + 1))):
    if v < 6000:
        wall[holes == i + 1] = True

plank = (AL > 200) & (abs(R - 175) < 35) & (abs(G - 127) < 35) & (B < 90)
pl, _ = ndimage.label(ndimage.binary_closing(plank, iterations=2))
planks = []
for sl in ndimage.find_objects(pl):
    if sl[1].stop - sl[1].start > 60:
        planks.append((sl[1].start * s, sl[0].start * s, sl[1].stop * s, sl[0].stop * s))

T, COLS = 5, 72
ROWS = int(np.ceil(im.height * s / T))
grid = []
for r in range(ROWS):
    row = []
    for c in range(COLS):
        x0, x1 = int(c * T / s), int((c + 1) * T / s)
        y0, y1 = int(r * T / s), int(min((r + 1) * T / s, im.height))
        cell = wall[y0:y1, x0:x1]
        row.append("#" if cell.size and cell.mean() > 0.5 else " ")
    grid.append(row)
for x0, y0, x1, y1 in planks:
    r = int(round(y0 / T)); c0 = int(round(x0 / T)); c1 = int(round(x1 / T)) - 1
    for c in range(c0, c1 + 1):
        if grid[r][c] == " ":
            grid[r][c] = "="
    for d in (-1, 1):
        c = c0 - 1 if d < 0 else c1 + 1; k = 0
        while 0 <= c < COLS and grid[r][c] == " " and k < 3:
            c += d; k += 1
        if 0 <= c < COLS and grid[r][c] == "#" and k:
            cc = c0 - 1 if d < 0 else c1 + 1
            for _ in range(k):
                grid[r][cc] = "="; cc += d
# smooth the walls: little stone bumps (≤4 cells tall) sticking into a room become open,
# otherwise the frog can stand on them (it happened next to the fridge)
for side in (1, -1):
    for c in range(1, COLS - 1):
        r = 0
        while r < ROWS:
            bump = lambda rr: grid[rr][c] == "#" and grid[rr][c - side] == " " and grid[rr][c + side] == "#"
            if bump(r):
                r2 = r
                while r2 + 1 < ROWS and bump(r2 + 1): r2 += 1
                if r > 0 and grid[r - 1][c] == " " and r2 + 1 < ROWS and grid[r2 + 1][c] == " " and r2 - r < 4:
                    for rr in range(r, r2 + 1): grid[rr][c] = " "
                r = r2 + 1
            else:
                r += 1
grid = ["".join(g) for g in grid]

print("// castleBox: [0, 0, 360, %.1f]   world H: %d" % (im.height * s, ROWS * T))
print("\n".join('    "%s",' % g for g in grid))
print("// planks (x0, y0, x1, y1):", [tuple(round(v, 1) for v in p) for p in planks])

if a.check:
    k = 3
    art = im.resize((360 * k, round(im.height * s * k)))
    ov = Image.new("RGBA", art.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for r, row in enumerate(grid):
        for c, ch in enumerate(row):
            if ch == "#": d.rectangle([c * T * k, r * T * k, (c + 1) * T * k - 1, (r + 1) * T * k - 1], fill=(255, 0, 80, 60))
            if ch == "=": d.rectangle([c * T * k, r * T * k, (c + 1) * T * k - 1, r * T * k + 4], fill=(0, 200, 255, 230))
    bg = Image.new("RGBA", art.size, (255, 255, 255, 255)); bg.alpha_composite(art); bg.alpha_composite(ov)
    bg.convert("RGB").save(a.check)
