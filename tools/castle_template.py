# Makes the castle drawing templates in site/assets/castle/ from the game map.
# If you change MAP in site/js/castle.js, copy it here too and rerun:  python3 tools/castle_template.py
import os
from PIL import Image, ImageDraw, ImageFont
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site", "assets", "castle")
K = 4                       # 4 × the 360 × 600 game world
W, H, T = 360, 600, 20
MAP = [
"                  ","                  ","                  ","                  ",
"###               ","###               ","###            ###","###            ###",
"######  ##===#####","#        #       #","#        #       #","#          ==    #",
"#                #","#                #","##===##########  #","#        #       #",
"#        #       #","#  ===           #","#                #","#                #",
"###  ########===##","#        #       #","#        #       #","#            ==  #",
"#                #","#                #","##################","##################",
"##################","##################"]
VY0, VY1 = 58, 552          # what the page shows of the world (top / bottom)
STONE = (163, 158, 233, 255); ROOM = (239, 238, 252, 255); PLANK = (51, 196, 230, 255)
ROOF = (61, 35, 214, 255); LINE = (42, 28, 154, 255)
mono = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
try:
    F = ImageFont.truetype(mono, 13 * K // 2); FS = ImageFont.truetype(mono, 10 * K // 2); FB = ImageFont.truetype(mono.replace("Mono.ttf","Mono-Bold.ttf"), 15 * K // 2)
except Exception:
    F = FS = FB = ImageFont.load_default()
def R(x0, y0, x1, y1): return [x0 * K, y0 * K, x1 * K, y1 * K]

def base(guides):
    im = Image.new("RGBA", (W * K, H * K), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # room interiors (the space behind the walls you see inside the castle)
    for r in range(8, 26):
        for c in range(1, 17):
            if MAP[r][c] != "#": d.rectangle(R(c*T, r*T, c*T+T, r*T+T), fill=ROOM)
    # stone: everything solid
    for r, row in enumerate(MAP):
        for c, ch in enumerate(row):
            if ch == "#": d.rectangle(R(c*T, r*T, c*T+T, r*T+T), fill=STONE)
    # wooden planks / shelves: you can stand on the top 7px and jump up through them
    for r, row in enumerate(MAP):
        for c, ch in enumerate(row):
            if ch == "=": d.rectangle(R(c*T, r*T, c*T+T, r*T+7), fill=PLANK)
    # tower roof and turret battlements
    d.polygon([(-6*K, 81*K), (30*K, 14*K), (66*K, 81*K)], fill=ROOF)
    for mx in (300, 324, 348): d.rectangle(R(mx, 111, mx+12, 120), fill=STONE)
    # thin outline around the stone so the shape reads clearly
    return im, d

# 1) clean silhouette to draw over
im, d = base(False)
im.save(os.path.join(OUT, "castle-silhouette.png"))

# 2) the same with guides: what is solid, where things happen, what part shows on the page
im, d = base(True)
def dash_h(y, col, label):
    for x in range(0, W*K, 24): d.line([x, y*K, x+12, y*K], fill=col, width=K)
    d.text((6*K, y*K + 4), label, font=FS, fill=col)
PINK = (255, 45, 111, 255); GREEN = (22, 129, 90, 255)
# glowing things (doors to pages): the frog stands in these to go in
SPOTS = [("library → works", [10,12,2,2]), ("mural studio → murals", [13,17,3,3]), ("arcade TV → Frog Jump", [1,17,2,3]),
         ("my room → about", [1,12,3,2]), ("great hall → the Frog", [5,22,2,4]), ("post room → contact", [15,23,2,3])]
for name, (c, r, w, h) in SPOTS:
    d.rectangle(R(c*T, r*T, (c+w)*T, (r+h)*T), outline=PINK, width=K)
    tw = d.textlength(name, font=FS)
    x = min((c)*T*K + 6, W*K - tw - 8)
    d.text((x, (r*T - 13)*K), name, font=FS, fill=PINK)
# bed (bounces), spikes, mace
d.rectangle(R(100, 262, 160, 280), outline=GREEN, width=K); d.text((100*K, 284*K), "bed (bounce)", font=FS, fill=GREEN)
d.rectangle(R(242, 511, 278, 520), outline=PINK, width=K); d.text((236*K, 496*K), "spikes", font=FS, fill=PINK)
d.ellipse(R(209, 297, 215, 303), fill=PINK); d.arc(R(132, 224, 292, 384), 30, 150, fill=PINK, width=K); d.text((222*K, 290*K), "mace pivot + swing", font=FS, fill=PINK)
# room names
for name, c0, r0 in [("MY ROOM", 1, 9), ("LIBRARY", 10, 9), ("ARCADE", 1, 15), ("MURAL STUDIO", 10, 15), ("GREAT HALL", 1, 21), ("POST ROOM", 10, 21), ("ROOF", 9, 4)]:
    d.text(((c0*T + 4)*K, (r0*T + 3)*K), name, font=FB, fill=LINE)
# frog for scale (hitbox 12×16, drawn about 30px tall)
d.rectangle(R(42, 485, 57, 505), outline=GREEN, width=K); d.text((61*K, 489*K), "frog size", font=FS, fill=GREEN)
# what the page shows
dash_h(VY0, PINK, "top of the castle window: only the tower roof pokes out above this line (over the menu bar)")
dash_h(VY1, PINK, "bottom of the castle window: below this is hidden")
# legend
lg = [(STONE, "stone: solid walls and floors"), (PLANK, "wood plank: stand on top, jump up through"), (ROOM, "room background"), (ROOF, "tower roof")]
for i, (col, txt) in enumerate(lg):
    y = 6 + i * 14
    d.rectangle(R(150, y, 160, y + 10), fill=col, outline=LINE)
    d.text((166*K, (y-1)*K), txt, font=FS, fill=LINE)
im.save(os.path.join(OUT, "castle-silhouette-guides.png"))
print("ok")
