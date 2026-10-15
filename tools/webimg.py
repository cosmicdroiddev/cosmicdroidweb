"""Turn big original images into light WebP files for the site.

    python3 tools/webimg.py SOURCE OUT_BASE [--full 2000] [--small 1000] [--q 82]

Writes OUT_BASE.webp (long side <= --full) and OUT_BASE-sm.webp (long side <= --small).
If the source is already small, only OUT_BASE.webp is written and the -sm copy is skipped.
Transparency is kept. The original file is never touched.
"""
import os, sys, argparse
from PIL import Image, ImageOps


def save(im, path, long_side, q):
    im = im.copy()
    im.thumbnail((long_side, long_side), Image.LANCZOS)
    im.save(path, "WEBP", quality=q, method=6)
    return im.size, os.path.getsize(path)


def convert(src, out_base, full=2000, small=1000, q=82):
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)  # phone photos: respect rotation
    im = im.convert("RGBA") if ("A" in im.getbands() or im.mode == "P") else im.convert("RGB")
    if im.mode == "RGBA" and im.getchannel("A").getextrema() == (255, 255):
        im = im.convert("RGB")
    os.makedirs(os.path.dirname(out_base) or ".", exist_ok=True)
    out = {}
    out["full"] = save(im, out_base + ".webp", full, q)
    if max(im.size) > small * 1.15:
        out["small"] = save(im, out_base + "-sm.webp", small, q)
    return out


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("src"); a.add_argument("out")
    a.add_argument("--full", type=int, default=2000)
    a.add_argument("--small", type=int, default=1000)
    a.add_argument("--q", type=int, default=82)
    o = a.parse_args()
    before = os.path.getsize(o.src)
    r = convert(o.src, o.out, o.full, o.small, o.q)
    print(f"{o.src}: {before/1e6:.2f} MB -> " + ", ".join(f"{k} {s[0]}x{s[1]} {b/1e3:.0f} KB" for k, (s, b) in r.items()))
