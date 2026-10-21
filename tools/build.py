import os, re
# Builds the HTML pages in ../site from the templates below.
# Run from anywhere:  python3 tools/build.py
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Space+Mono:wght@400;700&family=Pirata+One&family=VT323&family=Germania+One&display=swap">')

NAV = [("work.html", "Works"), ("about.html", "About"), ("contact.html", "Contact")]

# the Frog Jump overlay is unchanged
INTRO = '''<div class="intro" id="intro" role="dialog" aria-modal="true" aria-label="Frog Jump, a small game" hidden>
  <div class="intro-stage">
    <canvas width="400" height="640" tabindex="-1" aria-label="Game area. Steer the Frog left and right and lick monsters."></canvas>
    <div class="intro-screen" data-screen="title">
      <div class="intro-card">
        <p class="intro-logo">cosmicdroid</p>
        <p>Help the Frog climb the haunted castle, floor by floor, or slip straight into the gallery.</p>
        <div class="intro-actions">
          <button class="button" type="button" data-action="play">Play</button>
          <button class="button ghost" type="button" data-action="enter">Back to the castle</button>
        </div>
        <p class="intro-keys">← → to steer, click to aim the tongue<br>phones: tilt to steer, tap to aim</p>
        <p class="intro-keys">best: <span data-best>0</span></p>
      </div>
    </div>
    <div class="intro-screen" data-screen="tilt" hidden>
      <div class="intro-card">
        <p class="intro-big intro-warn">tilt is off</p>
        <p>Frog Jump is played by tilting your phone left and right. Without motion access the Frog can't steer, so the game won't work as intended.</p>
        <p class="intro-keys">If you said no by mistake, tap "try again". On iPhone you may need to close and reopen the page first.</p>
        <div class="intro-actions">
          <button class="button" type="button" data-action="tilt-retry">Try again</button>
          <button class="button ghost" type="button" data-action="tilt-anyway">Play anyway</button>
        </div>
        <button class="intro-skip" type="button" data-action="enter">back to the castle</button>
      </div>
    </div>
    <div class="intro-screen" data-screen="over" hidden>
      <div class="intro-card">
        <p data-cause>The Frog fell into the dark</p>
        <p class="intro-big" data-score>0</p>
        <p class="intro-keys">reached <span data-floor>The Dungeon</span><br>best: <span data-best>0</span></p>
        <div class="intro-actions">
          <button class="button" type="button" data-action="play">Play again</button>
          <button class="button ghost" type="button" data-action="enter">Back to the castle</button>
        </div>
      </div>
    </div>
  </div>
  <div class="intro-controls">
    <button class="tongue-btn" type="button" data-tongue hidden aria-label="Stick out the tongue">lick</button>
  </div>
  <div class="intro-bar">
    <span class="intro-hint" hidden>hold left or right to steer</span>
    <button class="intro-skip" type="button" data-action="enter">back to the castle (esc)</button>
  </div>
</div>
'''

ICON_MAIL = '<svg viewBox="0 0 32 24" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="21" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 3l14 11L30 3M2 21l10-9M30 21l-10-9" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
ICON_IG = '<svg class="ic-ig" viewBox="0 0 28 28" aria-hidden="true"><rect x="2" y="2" width="24" height="24" rx="6" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="14" cy="14" r="5.6" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="21" cy="7" r="1.6" fill="currentColor"/></svg>'
# placeholder frog mark until the real logo goes into js/media.js ("logo-icon")
FROG_MARK = '''<svg viewBox="0 0 64 64" aria-hidden="true" class="frog-mark">
  <ellipse cx="32" cy="40" rx="22" ry="16" fill="#4fe0b8" stroke="#2a1fb0" stroke-width="3"/>
  <circle cx="21" cy="24" r="9" fill="#fff" stroke="#2a1fb0" stroke-width="3"/><circle cx="43" cy="24" r="9" fill="#fff" stroke="#2a1fb0" stroke-width="3"/>
  <circle cx="23" cy="25" r="3.4" fill="#2a1fb0"/><circle cx="45" cy="25" r="3.4" fill="#2a1fb0"/>
  <rect x="10" y="33" width="44" height="6" fill="#e6f43c" stroke="#2a1fb0" stroke-width="2.4"/>
  <path d="M26 46q6 4 12 0" fill="none" stroke="#2a1fb0" stroke-width="2.6" stroke-linecap="round"/>
</svg>'''


def slot(name, size, cls="", ratio="1 / 1", alt="", style="", eager=False):
    c = f'<figure class="slot{(" " + cls) if cls else ""}" data-slot="{name}" data-size="{size}" data-alt="{alt}" style="--ratio: {ratio};{style}"{" data-eager" if eager else ""}></figure>'
    return c


def page(fname, title, desc, body, current, base="", home=False):
    nav = "\n".join(
        f'      <a href="{base}{h}"{" aria-current=\"page\"" if h == current else ""}><span class="nav-num">0{i + 1}</span>{l}<span class="nav-arrow" aria-hidden="true">↗</span></a>'
        for i, (h, l) in enumerate(NAV))
    html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta name="theme-color" content="#dce9fb">
<link rel="icon" href="{base}assets/favicon.svg" type="image/svg+xml">
{FONTS}
<link rel="stylesheet" href="{base}css/style.css">
{f'<link rel="stylesheet" href="{base}css/flipbook.css">' + chr(10) if fname == "leapkill.html" else ""}<script>try{{if(!sessionStorage.getItem("cd-loaded"))document.documentElement.classList.add("is-loading")}}catch(e){{document.documentElement.classList.add("is-loading")}}</script>
</head>
<body data-base="{base}"{"" if home else ' class="bar-purple"'}>
<div class="loader" id="loader" aria-hidden="true">
  <div class="loader-inner">
    <img class="loader-art" src="{base}assets/img/loader.webp" alt="" width="180" height="200">
    <p class="loader-text">loading<span class="loader-dots"></span></p>
  </div>
</div>
{INTRO if home else ""}<div class="frame">
<header class="site-header">
  <a class="brand-icon" href="{base}index.html" aria-label="cosmicdroid home" data-logo="logo-icon">{FROG_MARK}</a>
  <a class="brand-word" href="{base}index.html" data-logo="logo-wordmark"><span>cosmicdroid</span></a>
  <nav class="nav" id="site-nav" aria-label="Main">
{nav}
  </nav>
  <div class="socials">
    <a href="mailto:cosmicdroidworld@gmail.com" aria-label="Email cosmicdroid">{ICON_MAIL}</a>
    <a href="https://www.instagram.com/cosmicdroid/" rel="noopener" aria-label="cosmicdroid on Instagram">{ICON_IG}</a>
  </div>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span class="burger" aria-hidden="true"><i></i><i></i><i></i></span></button>
</header>
<main>
{body}
</main>
<footer class="site-footer">
  <div class="foot-cell foot-critter">{slot("footer-critter", "480×300", ratio="16 / 10", alt="A frog working on a laptop")}</div>
  <div class="foot-cell foot-text foot-facts" data-frog-facts>
    <p class="fact-label">frog fact</p>
    <p class="fact-text" aria-live="polite">A group of frogs is called an army.</p>
  </div>
  <div class="foot-cell foot-links">
    <a href="mailto:cosmicdroidworld@gmail.com">cosmicdroidworld@gmail.com</a>
    <a href="https://www.instagram.com/cosmicdroid/" rel="noopener">@cosmicdroid ↗</a>
  </div>
</footer>
</div>
<script src="{base}js/media.js"></script>
<script src="{base}js/projects.js"></script>
<script src="{base}js/main.js"></script>
{f'<script src="{base}js/flipbook.js"></script>' + chr(10) if fname == "leapkill.html" else ""}{f'<script src="{base}js/game.js"></script>' + chr(10) + f'<script src="{base}js/castle.js"></script>' + chr(10) if home else ""}</body>
</html>
'''
    path = os.path.join(ROOT, fname)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w").write(html)


def ticker(words):
    run = "".join(f"<span>{w}</span><i aria-hidden=\"true\">✦</i>" for w in words)
    return f'''<div class="ticker" aria-label="{', '.join(words)}">
  <div class="ticker-track" aria-hidden="true">{run}{run}{run}</div>
</div>'''

TICK = ticker(["illustration", "murals", "animation", "branding", "character design", "merch"])


def bar(title, link=None, base="", tag="h2"):
    l = f'<a class="bar-link" href="{base}{link[0]}">{link[1]} <span aria-hidden="true">↗</span></a>' if link else ""
    return f'<div class="bar"><{tag} class="bar-title">{title}</{tag}>{l}</div>'


def cta(base=""):
    return f'''<section class="cta">
  <p>Got a wall, a band or a brand that needs weird little guys?</p>
  <a class="button lime" href="{base}contact.html">Start a project <span aria-hidden="true">↗</span></a>
</section>'''


def page_head(title, lede=None, extra=""):
    l = f'<p class="page-lede">{lede}</p>' if lede else ""
    return f'''<section class="page-head">
  <div class="page-head-title"><h1 class="page-title">{title}</h1></div>
  <div class="page-head-text">{extra}{l}</div>
</section>'''

# ---------- HOME ----------
services = [
    ("murals", "Murals", "Indoor and outdoor walls for cafes, shops, organizations and festivals. I travel for the right wall."),
    ("illustration", "Illustration", "Characters, posters, album and gig artwork, editorial pieces."),
    ("branding", "Branding", "Logos and identities with a mascot or two, plus the merch to go with them."),
    ("animation", "Animation", "Loops, GIFs and short animated pieces for social and screens."),
]
svc = "\n".join(
    f'    <div class="service"><span class="num">0{i + 1}</span>{slot("service-" + k, "120×120")}<h3>{t}</h3><p>{d}</p></div>'
    for i, (k, t, d) in enumerate(services))
best = "\n".join(
    f'    <figure class="cell-fig">{slot(f"bestiary-{i}", "400×400 loop", alt=f"Creature {i}")}</figure>'
    for i in range(1, 7))
rooms = [("work.html", "Works", "check out my latest work", ""), ("murals.html", "Murals", "fantasy on a bigger canvas", ""),
         ("index.html#play", "Arcade", "play Frog Jump", " data-play-frogjump"), ("about.html", "About", "random stuff about me", ""),
         ("contact.html", "Contact", "waiting for your idea!", "")]
room_list = "\n".join(
    f'      <li><a href="{h}"{x} data-room-art="room-{i + 1}"><span class="room-art" aria-hidden="true"><span class="runner room-runner"></span></span><b>{r}</b><span class="what">{w}</span><span class="arrow" aria-hidden="true">↗</span></a></li>'
    for i, (h, r, w, x) in enumerate(rooms))
room_lines = room_list.split("\n")
rooms_top, rooms_bottom = "\n".join(room_lines[:3]), "\n".join(room_lines[3:])

FILTERS = '''<div class="deck-filters" role="tablist" aria-label="Filter works">
    <button type="button" role="tab" data-filter="all" aria-selected="true">All</button>
    <button type="button" role="tab" data-filter="mural" aria-selected="false">Murals</button>
    <button type="button" role="tab" data-filter="work" aria-selected="false">Illustration &amp; branding</button>
  </div>'''
filters = FILTERS

home = f'''<section class="castle-hero" aria-label="cosmicdroid castle">
  <h1 class="sr-only">cosmicdroid portfolio</h1>
  <p class="hero-meta hero-tl" aria-hidden="true"><span>01</span> the castle</p>
  <p class="hero-meta hero-tr" aria-hidden="true">illustrator · animator · muralist</p>
  <p class="hero-meta hero-bl" aria-hidden="true">← → walk · space jump · ↑ go in</p>
  <a class="hero-meta hero-br scroll-cue" href="#more">scroll <span aria-hidden="true">↓</span></a>
  <div class="castle-stage" data-castle>
    <div class="castle-frame">
      <canvas width="360" height="600" tabindex="0" aria-label="A castle you can explore. Walk the Frog into a room and use the glowing object to open that part of the site. The same links are listed below the castle."></canvas>
    </div>
    <div class="castle-pad" aria-hidden="true">
      <div class="stick" data-stick><span class="stick-ring"></span><span class="stick-knob"></span></div>
      <div class="pad-mid">
        <button type="button" class="pad-btn pad-enter" data-pad="enter" tabindex="-1"><span>go</span></button>
        <a class="pad-scroll" href="#more" tabindex="-1">scroll ↓</a>
      </div>
      <button type="button" class="pad-btn pad-jump" data-pad="jump" tabindex="-1"><span>jump</span></button>
    </div>
  </div>
</section>
{TICK.replace('<div class="ticker"', '<div class="ticker" id="more"', 1)}
<section class="home-intro">
  <div class="castle-intro">
    <p class="castle-hello">Hey, I'm cosmicdroid.</p>
    <p>Illustrator, animator and muralist from Colombia. I make dark fantasy art with a 2000s heart: monsters, haunted places and characters with a little bite.</p>
    <a class="button" href="work.html">See my works <span aria-hidden="true">↗</span></a>
  </div>
  <div class="castle-guide guide-all">
    <ul class="room-list" aria-label="Rooms">
{room_list}
    </ul>
  </div>
  <a class="lk-cell" href="leapkill.html">
    <span class="label">my comic</span>
    <img src="assets/img/leapkill/title.gif" alt="Leap Kill, my comic" width="777" height="672">
    <span class="lk-go">enter <span aria-hidden="true">↗</span></span>
  </a>
</section>
<section class="block works-block">
  {bar("Works", ("work.html", "open the works page"))}
  {FILTERS}
  <div class="deck deck-all" data-deck="all"></div>
</section>
<section class="block">
  {bar("What I make")}
  <div class="cells cells-4">
{svc}
  </div>
</section>
''' + cta()
page("index.html", "cosmicdroid", "Illustrator, animator and muralist based in Colombia. Murals, characters, branding, merch and animation.", home, "index.html", home=True)

# ---------- WORKS ----------

works = page_head("Works", "Murals, illustration, branding, characters and merch, for clients and side quests. Hover a card to open it.") + f'''
<section class="block">
  {filters}
  <div class="deck deck-tall" data-deck="all"></div>
</section>
''' + cta()
page("work.html", "Works | cosmicdroid", "Murals, illustration, branding, character design and merch by cosmicdroid.", works, "work.html")

# ---------- MURALS (reached from the castle and the Works filter) ----------
murals = page_head("Murals", "Walls I've painted for organizations, businesses and friends. Based in Colombia and open to painting anywhere in the world.") + f'''
<section class="block">
  <div class="deck deck-tall" data-deck="mural"></div>
</section>
<section class="block">
  {bar("A wall, start to finish")}
  <div class="pad-cell">{slot("murals-timelapse", "16:9 video .mp4", ratio="16 / 9", alt="Mural timelapse")}</div>
</section>
''' + cta()
page("murals.html", "Murals | cosmicdroid", "Murals painted by cosmicdroid in Colombia and abroad.", murals, "work.html")


# ---------- LEAP KILL ----------
def lk_gallery(items, cls, start=1):
    """items: (file in assets/img/leapkill without .webp, alt, caption or None)"""
    d = os.path.join(ROOT, "assets", "img", "leapkill"); out = []
    for i, (name, alt, cap) in enumerate(items):
        small = name + ("-sm" if os.path.exists(os.path.join(d, name + "-sm.webp")) else "")
        c = f'<span class="g-cap"><span class="num">0{i + start}</span>{cap}</span>' if cap else ""
        out.append(f'    <button type="button" data-full="assets/img/leapkill/{name}.webp" aria-label="Enlarge: {alt}">'
                   f'<img src="assets/img/leapkill/{small}.webp" alt="{alt}" loading="lazy">{c}</button>')
    return f'<div class="gallery {cls}">\n' + "\n".join(out) + "\n  </div>"


lk_photos = lk_gallery([
    ("photo-pack", "The Leap Kill Vol. 01 pack, sealed", None),
    ("photo-stickers", "The comic with its holographic stickers", None),
    ("photo-holo", "A pile of packed Leap Kill comics and stickers", None),
    ("photo-table", "Packing the comics on the cutting mat", None),
    ("photo-comic", "Holding the printed comic", None)], "gallery-photo gallery-tall lk-photos")
lk_stickers = lk_gallery([
    ("sticker-1", "Leap Kill sticker: the logo and the sleeping hero", None),
    ("sticker-2", "Leap Kill sticker: the vampire in a ring of thorns", None),
    ("sticker-3", "Leap Kill sticker: the robot with a screen", None)], "gallery-art gallery-3 lk-stickers", start=3)
lk_sketch = lk_gallery([("sketch", "Thumbnail sketches for every page of the comic", None)], "gallery-art lk-sketch")
lk_label = lk_gallery([("packaging", "The Leap Kill pack label: includes a videogame", None)], "gallery-art lk-label", start=2)
lk_sprites = "\n".join(
    f'    <figure class="lk-sprite"><img src="assets/img/leapkill/game-{f}.gif" alt="{alt}" width="100" height="100" loading="lazy"><figcaption>{cap}</figcaption></figure>'
    for i, (f, alt, cap) in enumerate([
        ("frog-idle", "The hero standing", "hero · idle"), ("frog-run", "The hero running", "hero · run"),
        ("frog-attack", "The hero attacking", "hero · attack"), ("kermit-walk", "The bat frog walking", "bat frog · walk"),
        ("kermit-fly", "The bat frog flying", "bat frog · fly"), ("kermit-attack", "The bat frog attacking", "bat frog · attack")]))
leapkill = f'''<section class="lk-hero">
  <div class="lk-hero-art lk-reader" id="read" data-flipbook aria-label="Read Leap Kill Vol. 01">
  <div class="lk-stage">
    <div class="lk-book-size">
      <div class="lk-book-shift at-cover" style="position:relative">
        <div class="lk-book">
          <div class="lk-page" data-cover><img src="assets/img/leapkill/book/01.jpg" alt="Front cover: Leap Kill, Vol. 01" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/02.jpg" alt="Hola, soy cosmicdroid: intro page" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/03.jpg" alt="The castle siege" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/04.jpg" alt="The dragon fight" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/05.jpg" alt="The casino portal" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/06.jpg" alt="The jungle temple" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/07.jpg" alt="The noodle bar showdown" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/08.jpg" alt="The robot factory, left half of the centerfold" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/09.jpg" alt="The robot factory, right half of the centerfold" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/10.jpg" alt="The anglerfish dive" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/11.jpg" alt="Jungle jeep and the monkey" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/12.jpg" alt="The concert" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/13.jpg" alt="The pyramid" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/14.jpg" alt="Back to the castle gate" width="900" height="1386" draggable="false"></div>
          <div class="lk-page"><img src="assets/img/leapkill/book/15.jpg" alt="Vampire frog, 2025" width="900" height="1386" draggable="false"></div>
          <div class="lk-page" data-cover><img src="assets/img/leapkill/book/16.jpg" alt="Back cover: @cosmicdroid" width="900" height="1386" draggable="false"></div>
        </div>
        <span class="lk-nudge" aria-hidden="true">turn the page ←</span>
      </div>
    </div>
    <div class="lk-controls">
      <button class="lk-btn" type="button" data-prev aria-label="Previous page"><span aria-hidden="true">←</span><span class="lk-btn-word">back</span></button>
      <div class="lk-count">
        <span class="lk-count-text" aria-live="polite">cover</span>
        <span class="lk-progress" aria-hidden="true"><span></span></span>
      </div>
      <button class="lk-btn" type="button" data-next aria-label="Next page"><span class="lk-btn-word">next</span><span aria-hidden="true">→</span></button>
    </div>
  </div>
  </div>
  <div class="lk-hero-text">
    <h1 class="lk-hero-logo"><img src="assets/img/leapkill/title.gif" alt="Leap Kill" width="777" height="672"></h1>
    <p class="page-lede">Leap Kill is my comic and the little world around it. Vol. 01 comes as a pack with holographic stickers and its own videogame.</p>
    <dl class="facts lk-facts">
      <div><dt>issue</dt><dd>Vol. 01</dd></div>
      <div><dt>pages</dt><dd>16</dd></div>
      <div><dt>comes with</dt><dd>stickers + videogame</dd></div>
      <div><dt>year</dt><dd>2025</dd></div>
    </dl>
  </div>
  <div class="lk-hero-video">
    <video muted loop playsinline autoplay preload="auto" data-autoplay poster="assets/img/leapkill/pack-poster.webp" aria-label="Video: packing a Leap Kill pack by hand">
      <source src="assets/img/leapkill/pack.mp4" type="video/mp4">
    </video>
  </div>
</section>
{ticker(["leap kill", "vol. 01", "comic", "holographic stickers", "videogame", "by cosmicdroid"])}

<section class="block">
  {lk_photos}
</section>
<section class="block">
  <div class="lk-make">
    {lk_sketch}
    <div class="lk-make-right">
      {lk_label}
      {lk_stickers}
    </div>
  </div>
</section>
<section class="block">
  {bar("The videogame")}
  <div class="lk-game">
    <div class="lk-game-video">
      <video muted loop playsinline preload="none" data-autoplay poster="assets/img/leapkill/game-poster.webp" aria-label="Video: playing the Leap Kill videogame">
        <source src="assets/img/leapkill/game.mp4" type="video/mp4">
      </video>
    </div>
    <div class="lk-sprites">
{lk_sprites}
    </div>
  </div>
</section>
<section class="cta">
  <p>Want a copy of Leap Kill Vol. 01?</p>
  <a class="button lime" href="contact.html">Ask me for one <span aria-hidden="true">↗</span></a>
</section>
'''
page("leapkill.html", "Leap Kill | cosmicdroid", "Leap Kill, a comic by cosmicdroid. Vol. 01 comes with holographic stickers and a videogame.", leapkill, "")

# ---------- FROG ----------
frog = page_head("The Frog", "A lone bounty hunter frog who gets paid to kill monsters and keeps ending up in conversations he'd rather avoid. A personal universe of comics, paintings, toys and games, still being built.") + f'''
<section class="split">
  <div class="split-cell">{slot("frog-hero", "800×1000", ratio="4 / 5", alt="The Frog and Ciruela")}</div>
  <div class="split-cell stack">
    <div class="dossier">
      <div class="dossier-head">{slot("frog-icon", "200×200", alt="The Frog")}<div><h3>The Frog</h3><p class="role">bounty hunter</p></div></div>
      <ul>
        <li>Works alone and never asks for help</li>
        <li>Overthinks every job</li>
        <li>Plays drums, rides a skateboard</li>
        <li>Doesn't talk about his weak spots</li>
      </ul>
    </div>
    <div class="dossier">
      <div class="dossier-head">{slot("ciruela-icon", "200×200", alt="Ciruela the cat")}<div><h3>Ciruela</h3><p class="role">companion, transport</p></div></div>
      <ul>
        <li>Only says "miau"</li>
        <li>Cute, fluffy, deadly</li>
        <li>Carries the Frog between jobs</li>
        <li>Unimpressed by his excuses</li>
      </ul>
    </div>
  </div>
</section>
<section class="split">
  <div class="split-cell prose">
    <h2>Coming out of the swamp</h2>
    <p>Every job is a monster, and every monster is a little too familiar. The first chapters of the comic are in the works, along with prints, stickers and a small game you can play on the TV in the castle.</p>
    <p>Follow <a href="https://www.instagram.com/cosmicdroid/" rel="noopener">@cosmicdroid</a> to see new pages as they land.</p>
    <p><a class="button" href="index.html#play">Play Frog Jump <span aria-hidden="true">↗</span></a></p>
  </div>
  <div class="split-cell">{slot("frog-pages", "900×1200 comic page or animatic", ratio="3 / 4", alt="Comic page preview")}</div>
</section>
'''
page("frog.html", "The Frog | cosmicdroid", "The Frog, a bounty hunter frog and his cat Ciruela. A personal universe by cosmicdroid.", frog, "")

# ---------- ABOUT ----------
about = page_head("About") + f'''
<section class="split">
  <div class="split-cell about-portrait"><img src="assets/img/about/portrait-sm.webp" srcset="assets/img/about/portrait-sm.webp 600w, assets/img/about/portrait.webp 1067w" sizes="(max-width: 760px) 100vw, 45vw" alt="cosmicdroid sitting outside, drawing in a sketchbook" width="600" height="900"><img class="about-logo" src="assets/img/about/logo-overlay.webp" alt="" aria-hidden="true" width="1200" height="811"></div>
  <div class="split-cell prose">
    <p class="placeholder-note">Draft bio. Edit it to sound like you.</p>
    <p>I'm cosmicdroid, an illustrator, animator and muralist based in Colombia. I draw weird characters, haunted colors and small dark worlds, and I put them on walls, shirts, posters, album covers and screens.</p>
    <p>I studied computer engineering before switching paths to illustration and animation, so I'm as comfortable building an animated loop or a little game as I am on a ladder with a brush.</p>
    <p>I also play the drums, and my drawing is tied to the music I listen to: 2000s pop punk and post-hardcore, stoner rock, metal, a lot of guitars. If your project is loud, we'll get along.</p>
    <p>I've painted walls at home and abroad, including a youth refuge in Austria, and I'm happy to travel for the right wall.</p>
    <h2>Studies</h2>
    <ul class="timeline">
      <li><span class="year">2023</span><span>Master in Illustration &amp; Animation</span></li>
      <li><span class="year">2018</span><span>Bachelor in Computer Engineering</span></li>
    </ul>
  </div>
</section>
''' + cta()
page("about.html", "About | cosmicdroid", "About cosmicdroid, illustrator, animator and muralist based in Colombia.", about, "about.html")

# ---------- CONTACT ----------
contact = page_head("Contact") + f'''
<section class="split">
  <div class="split-cell">
    <form class="form" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-contact>
      <p class="form-intro">Tell me about your wall, brand or idea. I usually reply within a few days.</p>
      <input type="hidden" name="form-name" value="contact">
      <p class="hidden-field"><label>Leave this empty <input name="bot-field" id="bot-field"></label></p>
      <div class="form-row">
        <div class="field"><label for="name">Name</label><input id="name" name="name" type="text" autocomplete="name" required></div>
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="field"><label for="message">Tell me about it</label><textarea id="message" name="message" required placeholder="The idea, size or format, timeline, budget if you have one"></textarea></div>
      <div><button class="button" type="submit">Send message <span aria-hidden="true">↗</span></button></div>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
  <div class="split-cell contact-room">
    <video autoplay muted loop playsinline preload="auto" poster="assets/img/contact-room-poster.webp" aria-label="Animation: the frog's room in the castle">
      <source src="assets/img/contact-room.mp4" type="video/mp4">
    </video>
  </div>
</section>
'''
page("contact.html", "Contact | cosmicdroid", "Commission a mural, illustration, branding or animation from cosmicdroid.", contact, "contact.html")

# ---------- PROJECT PAGES ----------
# Images live in site/assets/img/<slug>/ as WebP, made with tools/webimg.py
# (NAME.webp is the big one for the zoom view, NAME-sm.webp the lighter one shown on the page).
def gallery(slug, items, cls=""):
    """items: (file name without .webp, alt text, caption or None)"""
    out = []
    d = os.path.join(ROOT, "assets", "img", slug)
    for i, (name, alt, cap) in enumerate(items):
        small = name + ("-sm" if os.path.exists(os.path.join(d, name + "-sm.webp")) else "")
        c = f'<span class="g-cap"><span class="num">0{i + 1}</span>{cap}</span>' if cap else ""
        out.append(f'    <button type="button" data-full="../assets/img/{slug}/{name}.webp" aria-label="Enlarge: {alt}">'
                   f'<img src="../assets/img/{slug}/{small}.webp" alt="{alt}" loading="lazy">{c}</button>')
    return f'<div class="gallery {cls}">\n' + "\n".join(out) + "\n  </div>"


def facts(rows):
    cells = []
    for k, v in rows:
        todo = ' class="todo"' if v.startswith("add ") else ""
        cells.append(f'<div><dt>{k}</dt><dd{todo}>{v}</dd></div>')
    return '<dl class="facts">' + "".join(cells) + '</dl>'


PAGER = """<section class="pager">
  <a href="../work.html">← all works</a>
  <a href="../contact.html">make something with me ↗</a>
</section>
"""
CRUMB = '<p class="crumb"><a href="../work.html">← all works</a></p>'

# ---------- MORE PROJECT PAGES (Oct 16) ----------
def vids(slug, items, cls=""):
    """Muted looping videos. items: (file name without .mp4, caption). They play only while on screen (main.js)."""
    out = []
    for i, (name, cap) in enumerate(items):
        c = f'<span class="g-cap"><span class="num">0{i + 1}</span>{cap}</span>' if cap else ""
        out.append(f'    <figure class="vid-cell"><video muted loop playsinline preload="none" data-autoplay '
                   f'poster="../assets/img/{slug}/{name}-poster.webp"><source src="../assets/img/{slug}/{name}.mp4" type="video/mp4"></video>{c}</figure>')
    return f'<div class="vid-row {cls}">\n' + "\n".join(out) + "\n  </div>"


# what each project is (the "type" box on its page)
TYPES = {
    "all-the-cores": "merch design", "juno-mural": "mural", "brutal-burger-quest": "game art",
    "big-cats-collection": "illustration series", "borea": "packaging", "botanica-mural": "mural",
    "cage-of-destiny": "game art", "cannabicultores": "festival poster", "imprint-rolling": "branding",
    "no-known-weakness": "album art", "organico": "shirt design", "pizzaneta": "mascot + merch",
    "sluggore": "band merch", "terp-wizard": "hoodie print", "terp-wizard-lab": "merch design",
}
ARROW_BACK = '<svg viewBox="0 0 64 36" aria-hidden="true"><path d="M2 18 L24 2 V11 H62 V25 H24 V34 Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>'


def proj_head(title):
    return f'''<section class="proj-head">
  <h1 class="proj-title">{title}</h1>
  <a class="proj-back" href="../work.html">{ARROW_BACK}<span>all works</span></a>
</section>
'''


def intro(slug, img, alt, paras, fact_rows, tall=True):
    small = img + ("-sm" if os.path.exists(os.path.join(ROOT, "assets", "img", slug, img + "-sm.webp")) else "")
    ps = "".join(f"<p>{p}</p>" for p in paras)
    year = dict(fact_rows).get("year", "")
    boxes = f'<dl class="proj-facts"><div><dt>type</dt><dd>{TYPES.get(slug, "")}</dd></div><div><dt>year</dt><dd>{year}</dd></div></dl>'
    return f'''<section class="proj-intro">
  <div class="proj-intro-art gallery gallery-photo">
    <button type="button" data-full="../assets/img/{slug}/{img}.webp" aria-label="Enlarge: {alt}">
      <img src="../assets/img/{slug}/{small}.webp" alt="{alt}">
    </button>
  </div>
  <div class="proj-intro-text prose">{ps}</div>
  {boxes}
</section>
<div class="proj-band" aria-hidden="true"></div>
'''


def _old_intro(slug, img, alt, paras, fact_rows, tall=True):
    small = img + ("-sm" if os.path.exists(os.path.join(ROOT, "assets", "img", slug, img + "-sm.webp")) else "")
    ps = "".join(f"<p>{p}</p>" for p in paras)
    return f'''<section class="split project-intro{"" if tall else " intro-wide"}">
  <div class="split-cell project-intro-art gallery gallery-photo">
    <button type="button" data-full="../assets/img/{slug}/{img}.webp" aria-label="Enlarge: {alt}">
      <img src="../assets/img/{slug}/{small}.webp" alt="{alt}">
    </button>
  </div>
  <div class="split-cell stack">
    <div class="prose">{ps}</div>
    {facts(fact_rows)}
  </div>
</section>
'''


def block(title, inner):
    # (the title is kept in the code as a note, but not shown: project pages only show the project name on top)
    return f'''<section class="block proj-block" data-section="{title}">
  {inner}
</section>
'''


def project(slug, title, lede, desc, body):
    # (lede is kept as a note for the card/SEO text; the page shows just the title, like the design)
    html = proj_head(title) + "\n" + body + PAGER
    page(f"projects/{slug}.html", f"{title} | cosmicdroid", desc, html, "work.html", base="../")


# All the Cores and More
project("all-the-cores", "All the Cores and More", "A shirt for All the Cores and More, who interview artists from the alternative and heavy music scene.",
        "A shirt design by cosmicdroid for All the Cores and More, who interview artists from the alternative and heavy music scene.",
        intro("all-the-cores", "shirts", "The finished All the Cores and More shirts, front and back",
              ["All the Cores and More is a brand that interviews artists from the alternative and heavy music scene. We teamed up on a merch drop: a shirt with a crest on the front and a full mosh pit of weird little guys on the back.",
               "Below is how each side came together, from the first sketch to the printed shirt."],
              [("year", "2026")])
        + block("Front", gallery("all-the-cores", [("sketch-front", "Front crest, first sketch", "sketch"), ("process-front", "Front crest, inked line art", "process"), ("digital-front", "Front crest, final digital art", "final digital")], "gallery-art gallery-3"))
        + block("Back", gallery("all-the-cores", [("sketch-back", "Back mosh pit, first sketch", "sketch"), ("process-back", "Back mosh pit, inked line art", "process"), ("digital-back", "Back mosh pit, final digital art", "final digital")], "gallery-art gallery-tall gallery-3"))
        + block("The shirt", gallery("all-the-cores", [("final-front", "The printed shirt, front", "front"), ("final-back", "The printed shirt, back", "back")], "gallery-photo gallery-tall gallery-2")))

# Juno mural
project("juno-mural", "Juno mural", "A mural for Juno, a non-profit youth refuge in Villach, Austria.",
        "A mural for Juno, a youth refuge in Villach, Austria, painted by cosmicdroid in 2024.",
        intro("juno-mural", "hero", "The finished Juno mural",
              ["A mural for Juno, a non-profit youth refuge in Villach, Austria. I designed and painted it together with a local artist.",
               "The wall was painted over a few days in late May and early June 2024. Below it goes from the first sketch over a photo of the house to the finished piece."],
              [("year", "2024")])
        + block("The design", gallery("juno-mural", [("sketch", "Juno mural, sketch over a photo of the house", "sketch"), ("design", "Juno mural, digital color design", "digital design")], "gallery-art gallery-2"))
        + block("Process", gallery("juno-mural", [(f"process-{i}", f"Juno mural in progress, photo {i}", None) for i in range(1, 7)], "gallery-photo gallery-tall gallery-3"))
        + block("Finished", gallery("juno-mural", [("final-1", "The Juno lettering wall", None), ("final-2", "The finished house, front", None), ("final-3", "The finished house and courtyard", None)], "gallery-photo gallery-3")))

# Brutal Burger Quest
project("brutal-burger-quest", "Brutal Burger Quest", "Pixel-art characters, bosses and tiles for a burger-fuelled game.",
        "Game art by cosmicdroid for Brutal Burger Quest: the player, enemies, mage bosses, tiles and effects.",
        intro("brutal-burger-quest", "cover", "Brutal Burger Quest title art: a horned mage holding a burger",
              ["Brutal Burger Quest is a little game about fighting your way to the ultimate burger. I drew the whole cast: the hero, the creatures that get in the way, a council of burger-hoarding mages, and the tiles and effects that hold the world together."],
              [("project", "Game art"), ("year", "2023"), ("made", "characters, tiles, effects")], tall=False)
        + block("In motion", vids("brutal-burger-quest", [("gameplay", "gameplay"), ("phone", "on the phone")], "vid-mixed"))
        + block("The cast", gallery("brutal-burger-quest", [("player", "The hero's sprite sheet", "hero"), ("enemies", "Enemy sprites: gorilla, bat and beetle", "enemies"), ("mages", "Twelve burger mages", "mages")], "gallery-free gallery-3"))
        + block("The world", gallery("brutal-burger-quest", [("tiles", "Ground and wall tiles", "tiles"), ("extras", "Explosions and breakable blocks", "effects")], "gallery-free gallery-2")))

# Big cats: interactive viewer
CATS = __import__("json").load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "big_cats.json")))
cat_thumbs = "\n".join(
    f'      <button type="button" class="cat-thumb" data-cat="{c["n"]}" data-bg="{c["bg"]}" style="--c:{c["bg"]}" aria-label="Cat {c["n"]:02d}">'
    f'<img src="../assets/img/big-cats-collection/cats/{c["n"]:02d}-sm.webp" alt="" loading="lazy" width="560" height="560"></button>'
    for c in CATS)
first = CATS[0]
cats_viewer = f'''<section class="cats" data-cats style="--cat-bg:{first["bg"]}">
  <div class="cats-stage">
    <button type="button" class="cats-arrow cats-prev" data-cat-step="-1" aria-label="Previous cat">←</button>
    <figure class="cats-main">
      <img src="../assets/img/big-cats-collection/cats/01.webp" alt="Big cat 01 of {len(CATS)}" width="1400" height="1400" data-cat-img>
    </figure>
    <button type="button" class="cats-arrow cats-next" data-cat-step="1" aria-label="Next cat">→</button>
    <div class="cats-hud">
      <span class="cats-count"><b data-cat-n>01</b> / {len(CATS)}</span>
      <button type="button" class="cats-shuffle" data-cat-random>shuffle ⚄</button>
    </div>
  </div>
  <div class="cats-strip" data-cat-strip>
{cat_thumbs}
  </div>
</section>
'''
project("big-cats-collection", "Big cats collection", f"{len(CATS)} wild cats, each in its own little world. Hover or swipe through them.",
        "An illustration series by cosmicdroid: wild cats from around the world, each in its own landscape.",
        intro("big-cats-collection", "sketches", "Pencil sketches for the big cats series",
                [f"A personal series of {len(CATS)} wild cats, from the snow leopard to the tiny sand cat. Each one sits in a landscape from where it lives, drawn with the same flat colors and a background that's all its own.",
                 "Everything started as pencil sketches, laid out together so the whole family would feel like one set."],
                [("project", "Illustration series"), ("cats", str(len(CATS))), ("year", "2023"), ("format", "square prints")], tall=False)
        + cats_viewer)

# Borea
project("borea", "Borea", "Packaging illustration for Borea: a box wrapped in a glowing undersea garden.",
        "Packaging illustration by cosmicdroid for Borea.",
        intro("borea", "cover", "The printed Borea box",
              ["A box for Borea, covered edge to edge in coral, kelp and little hidden creatures. The art wraps around every face, so the box reads as one scene when you turn it in your hands."],
              [("client", "Borea"), ("project", "Packaging"), ("year", "2024")])
        + block("Unboxing", vids("borea", [("box", None)], "vid-single"))
        + block("From line to box", gallery("borea", [("lineart", "Borea box, line art for each panel", "line art"), ("flat", "Borea box, the flat colored art", "color"), ("dieline", "Borea box, color test on the dieline", "dieline")], "gallery-art gallery-3")))

# Botanica mural
project("botanica-mural", "Botánica mural", "A castle tower, two dragons and a hooded wizard, painted big on a yellow wall.",
        "A mural painted by cosmicdroid: a castle tower guarded by dragons and bats.",
        intro("botanica-mural", "cover", "cosmicdroid in front of the finished mural",
              ["A wall I painted from a white sketch to a full castle: bats circling the tower, two dragons climbing it, and a hooded wizard holding the star at the bottom."],
              [("project", "Mural"), ("location", "add location"), ("year", "2022"), ("size", "add size")])
        + block("Timelapse", vids("botanica-mural", [("timelapse", None)], "vid-single vid-portrait"))
        + block("Step by step", gallery("botanica-mural", [(f"step-{i}", f"The mural, step {i}", f"step {i}") for i in range(1, 7)] + [("step-7", "The finished mural", "finished")], "gallery-photo gallery-tall gallery-steps")))

# Cage of Destiny
project("cage-of-destiny", "Cage of Destiny", "A game jam game made with Ash Badas. I did the art; it ranked #23 in presentation.",
        "Cage of Destiny, a game jam game by cosmicdroid and Ash Badas.",
        intro("cage-of-destiny", "cover", "Cage of Destiny cover art: a lizard king and a caged knight",
              ["A short game made for a game jam with Ash Badas: a knight locked in a cage has to escape a lizard king. I drew the characters, items, cutscenes and the title lettering.",
               "Out of the whole jam it ranked #23 for presentation and #34 for enjoyment, 72nd overall with 47 ratings."],
              [("with", "Ash Badas"), ("project", "Game art"), ("year", "2023"), ("presentation", "#23")], tall=False)
        + block("Gameplay", vids("cage-of-destiny", [("gameplay", None)], "vid-single"))
        + block("Art", gallery("cage-of-destiny", [("cutscene", "A cutscene: the king, the princess and the lizard", "cutscene"), ("sprites", "Characters and items", "sprites"), ("title", "Title lettering", "title"), ("ranking", "The jam results", "results")], "gallery-free gallery-2")))

# Cannabicultores
project("cannabicultores", "Cannabicultores", "The poster for the 2024 Cannabicultores festival in Manizales, Colombia.",
        "Festival poster illustration by cosmicdroid for Cannabicultores 2024 in Manizales, Colombia.",
        intro("cannabicultores", "cover", "The Cannabicultores banner hanging on a wall",
              ["A tower of little shops, plants and characters for the 2024 Cannabicultores festival, October 19 and 20 in Manizales. The art went on banners, posters and screens around the event."],
              [("client", "Cannabicultores"), ("event", "Oct 19–20, 2024"), ("location", "Manizales, Colombia"), ("project", "Poster")])
        + block("The illustration", gallery("cannabicultores", [("illustration", "The full Cannabicultores illustration", "illustration"), ("banner", "The printed banner", "banner"), ("posters", "Posters around town", "posters")], "gallery-free gallery-3"))
        + block("At the festival", vids("cannabicultores", [("festival", None)], "vid-single")))

# Imprint Rolling
project("imprint-rolling", "Imprint Rolling", "Wavy logos and packaging art for Imprint Rolling.",
        "Branding and packaging illustration by cosmicdroid for Imprint Rolling.",
        intro("imprint-rolling", "cover", "Imprint Rolling tubes with the printed art",
              ["A set of logos, stickers and packaging art for Imprint Rolling: melting letters, comic panels and a few strange creatures, made to work in one color or in full."],
              [("client", "Imprint Rolling"), ("project", "Branding, packaging"), ("year", "2026")])
        + block("The art", gallery("imprint-rolling", [(f"art-{i}", f"Imprint Rolling artwork {i}", None) for i in range(1, 9)], "gallery-art gallery-4")))

# No Known Weakness
project("no-known-weakness", "No Known Weakness", "Cover art for Tales From The Clydeside, the EP by Glasgow's No Known Weakness.",
        "Album cover art by cosmicdroid for No Known Weakness, Tales From The Clydeside.",
        intro("no-known-weakness", "cover", "The singer of No Known Weakness in front of the cover art",
              ["A cover for Tales From The Clydeside: Glasgow's river Clyde overrun by monsters, with the Squinty Bridge, the Finnieston Crane and the Armadillo all getting wrecked.",
               "It started from photos of the real places, then a sketch, line art and the final colors."],
              [("client", "No Known Weakness"), ("from", "Glasgow, UK"), ("release", "Tales From The Clydeside"), ("year", "2026")])
        + block("The cover", gallery("no-known-weakness", [("final", "Tales From The Clydeside, final cover", "final")], "gallery-art gallery-hero"))
        + block("Process", gallery("no-known-weakness", [("references", "Reference photos and first layout", "references"), ("sketch", "The sketch", "sketch"), ("lineart", "Line art", "line art")], "gallery-art gallery-3"))
        + block("Out there", gallery("no-known-weakness", [("bandcamp", "The EP on Bandcamp", "bandcamp"), ("spotify", "The EP on Spotify", "spotify")], "gallery-free gallery-2 gallery-phones")))

# Orgánico
project("organico", "Orgánico", "“Menos ego, más alma”: a shirt with a tiger and a crocodile tangled in a jungle wave.",
        "Shirt design by cosmicdroid for Orgánico.",
        intro("organico", "lineart", "Orgánico, the line art",
              ["A shirt design for Orgánico: a tiger and a crocodile spiralling through leaves and water, under the motto “menos ego, más alma” (less ego, more soul). Screen printed by hand."],
              [("client", "Orgánico"), ("project", "Shirt design"), ("year", "2023")], tall=False)
        + block("Line to color", gallery("organico", [("lineart", "Orgánico line art", "line art"), ("final", "Orgánico final colors", "final")], "gallery-art gallery-2"))
        + block("Printing it", vids("organico", [("process-1", "screen printing"), ("process-2", "the shirt")], "vid-portrait-row")))

# Pizzaneta
project("pizzaneta", "Pizzaneta", "“Let's munch”: a pizza wizard, a logo and a lot of tie-dye shirts.",
        "Branding and merch by cosmicdroid for Pizzaneta.",
        intro("pizzaneta", "cover", "The Let's Munch shirt",
              ["Pizzaneta needed a character to go with the logo, so I drew a pizza wizard chilling in his oven tower with a dragon. It ended up on shirts, tie-dye and all."],
              [("client", "Pizzaneta"), ("project", "Mascot, logo, merch"), ("year", "2022")])
        + block("The art", gallery("pizzaneta", [("art", "The Let's Munch artwork", "artwork"), ("logo", "The Pizzaneta logo", "logo")], "gallery-art gallery-2"))
        + block("Shirts", gallery("pizzaneta", [("shirt-blue", "Tie-dye shirt, back", None), ("shirt-worn", "Tie-dye shirt, front logo", None), ("shirt-back", "Cream shirt, back", None), ("kitchen", "The Pizzaneta team at work", None)], "gallery-photo gallery-2"))
        + block("Drawing it", vids("pizzaneta", [("promo", None)], "vid-single vid-portrait")))

# Sluggore
project("sluggore", "Sluggore", "A two-sided band shirt: sea monsters on the back, chrome lettering on the front.",
        "Band merch by cosmicdroid for Sluggore.",
        intro("sluggore", "band", "The band holding up the shirt",
              ["A shirt for Sluggore: a kaiju and a sea serpent locked in a fight on the back, and a sharp chrome logo on the front."],
              [("client", "Sluggore"), ("project", "Band merch"), ("year", "2024")], tall=False)
        + block("From sketch to lines", gallery("sluggore", [("sketch", "First sketch", "sketch"), ("sketch-2", "Refined sketch", "refined"), ("lineart", "Final line art", "line art")], "gallery-art gallery-3"))
        + block("The shirt", gallery("sluggore", [("shirt-back", "The shirt, back", "back"), ("shirt-front", "The shirt, front", "front")], "gallery-photo gallery-tall gallery-2"))
        + block("In motion", vids("sluggore", [("shirt", None), ("shirt-2", None)], "vid-mixed")))

# Terp Wizard: the cauldron
project("terp-wizard", "Terp Wizard: the cauldron", "A hoodie print: three hooded wizards brewing something strong.",
        "Merch design by cosmicdroid for Terp Wizard: the cauldron hoodie.",
        intro("terp-wizard", "hoodie", "The Terp Wizard hoodie in the greenhouse",
              ["A back print for Terp Wizard: three hooded wizards around a bubbling cauldron, with smoke curling all the way up the hood. From red pencil sketches to line art, the final colors and the print shop."],
              [("client", "Terp Wizard"), ("project", "Hoodie print"), ("year", "2023")])
        + block("Sketch to lines", gallery("terp-wizard", [("sketch-1", "First pencil sketch", "sketch"), ("sketch-2", "Second pencil sketch", "sketch 2"), ("lineart", "Line art", "line art")], "gallery-art gallery-tall gallery-3"))
        + block("Color and print", gallery("terp-wizard", [("digital", "Final colors", "final"), ("printing", "Fresh off the press", "printing"), ("print-detail", "Print detail", "detail")], "gallery-photo gallery-tall gallery-3")))

# Terp Wizard: the lab
project("terp-wizard-lab", "Terp Wizard: the lab", "A wizard in his potion lab, for a second Terp Wizard drop.",
        "Merch design by cosmicdroid for Terp Wizard: the lab.",
        intro("terp-wizard-lab", "final", "Terp Wizard: the lab, final colors",
              ["The second design for Terp Wizard: a wizard at his workbench, surrounded by skulls, jars and bubbling flasks, with dripping lettering underneath. It went on hoodies and tees with a small chest print on the front."],
              [("client", "Terp Wizard"), ("project", "Hoodie + tee"), ("year", "2026")])
        + block("Sketch to color", gallery("terp-wizard-lab", [("sketch", "Pencil sketch", "sketch"), ("final", "Final colors", "final")], "gallery-art gallery-tall gallery-2"))
        + block("Worn", gallery("terp-wizard-lab", [(f"worn-{i}", f"The finished merch, photo {i}", None) for i in range(1, 5)], "gallery-photo gallery-tall gallery-4")))

print("ok")
