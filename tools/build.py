import os, re
# Builds the HTML pages in ../site from the templates below.
# Run from anywhere:  python3 tools/build.py
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Space+Mono:wght@400;700&family=Pirata+One&family=VT323&family=Germania+One&display=swap">')

NAV = [("work.html", "Works"), ("about.html", "About"), ("contact.html", "Contact")]

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
<div class="frame">
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
{f'<script src="{base}js/flipbook.js"></script>' + chr(10) if fname == "leapkill.html" else ""}{f'<script src="{base}js/arcade.js"></script>' + chr(10) if home or fname == "leapkill.html" else ""}{f'<script src="{base}js/castle.js"></script>' + chr(10) if home else ""}</body>
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
    ("illustration", "Illustration", "Characters, posters, album and gig artwork, editorial pieces."),
    ("branding", "Branding", "Logos and identities with a mascot or two, plus the merch to go with them."),
    ("animation", "Animation", "Loops, GIFs and short animated pieces for social and screens."),
    ("murals", "Murals", "Indoor and outdoor walls for cafes, shops, organizations and festivals."),
]
svc = "\n".join(
    f'    <div class="service"><span class="num">0{i + 1}</span>{slot("service-" + k, "120×120")}<h3>{t}</h3><p>{d}</p></div>'
    for i, (k, t, d) in enumerate(services))
best = "\n".join(
    f'    <figure class="cell-fig">{slot(f"bestiary-{i}", "400×400 loop", alt=f"Creature {i}")}</figure>'
    for i in range(1, 7))
rooms = [("work.html", "Works", "check out my latest work", ""), ("murals.html", "Murals", "fantasy on a bigger canvas", ""),
         ("index.html#play", "Arcade", "play Leap Kill", " data-play-game"), ("about.html", "About", "random stuff about me", ""),
         ("contact.html", "Contact", "waiting for your idea!", "")]
room_list = "\n".join(
    f'      <li><a href="{h}"{x} data-room-art="room-{i + 1}"><span class="room-art" aria-hidden="true"><span class="runner room-runner"></span></span><b>{r}</b><span class="what">{w}</span><span class="arrow" aria-hidden="true">↗</span></a></li>'
    for i, (h, r, w, x) in enumerate(rooms))
room_lines = room_list.split("\n")
rooms_top, rooms_bottom = "\n".join(room_lines[:3]), "\n".join(room_lines[3:])

FILTERS = '''<div class="deck-filters" role="tablist" aria-label="Filter works">
    <button type="button" role="tab" data-filter="all" aria-selected="true">All works</button>
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

works = page_head("Works", "Murals, illustration, branding, characters and merch, for clients and side quests.") + f'''
<section class="block">
  {filters}
  <div class="works-grid" data-deck="all" data-grid></div>
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
      <div><dt>year</dt><dd>2025</dd></div>
      <div><dt>extras</dt><dd>stickers</dd></div>
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
    <a class="lk-game-video" href="#play" data-play-game aria-label="Play the Leap Kill videogame">
      <video muted loop playsinline preload="none" data-autoplay poster="assets/img/leapkill/game-poster.webp" aria-label="Video: playing the Leap Kill videogame">
        <source src="assets/img/leapkill/game.mp4" type="video/mp4">
      </video>
    </a>
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
    <p><a class="button" href="index.html#play">Play Leap Kill <span aria-hidden="true">↗</span></a></p>
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
    "sluggore": "band merch", "terp-wizard": "merch design", "8doce": "illustration", "catacomb": "jersey design", "westword": "editorial illustration", "gamehendge": "festival merch", "localsonly": "merch design", "jfgprintco": "branding + mural",
}
ARROW_BACK = '<svg viewBox="0 0 64 36" aria-hidden="true"><path d="M2 18 L24 2 V11 H62 V25 H24 V34 Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>'


def proj_head(title):
    return f'''<section class="proj-head">
  <h1 class="proj-title">{title}</h1>
  <div class="proj-back"><a class="button" href="../work.html"><span aria-hidden="true">←</span> All works</a></div>
</section>
'''


def intro(slug, img, alt, paras, fact_rows, tall=True):
    small = img + ("-sm" if os.path.exists(os.path.join(ROOT, "assets", "img", slug, img + "-sm.webp")) else "")
    ps = "".join(f"<p>{p}</p>" for p in paras)
    year = dict(fact_rows).get("year") or (re.search(r'slug: "%s".*?year: "([^"]+)"' % slug, open(os.path.join(ROOT, "js", "projects.js"), encoding="utf-8").read()) or [None, ""])[1]
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
# Juno mural
# Brutal Burger Quest
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
# Borea
# Botanica mural
# Cage of Destiny
# Cannabicultores
# Imprint Rolling
# No Known Weakness
# Orgánico
# Pizzaneta
# Sluggore
# Terp Wizard: the cauldron
def next_project(slug):
    """The next project (with a page) after this one in js/projects.js, wrapping around."""
    src = open(os.path.join(ROOT, "js", "projects.js"), encoding="utf-8").read()
    items = re.findall(r'slug: "([^"]+)", title: "([^"]+)",.*?tag: "([^"]+)".*?cover: "([^"]+)", page: "([^"]+)"', src)
    i = [x[0] for x in items].index(slug)
    return items[(i + 1) % len(items)]

# ---------- BENTO work pages (Oct 22): every picture fills its box, boxes fit together with no gaps ----------
# Desktop: a 6-column grid of square units; each cell says where it sits ("c" columns, "r" rows, CSS grid lines).
# Phones: 2 columns; each cell is full width ("m": 2) or half ("m": 1), with its own shape ("ar").
# Cell kinds: "img" fills its box (cropped), "art" sits whole on a cream panel, "vid", "text", "next".
def bento(slug, title, desc, intro_paras, cells, rows, after=""):
    small = lambda n: n + ("-sm" if os.path.exists(os.path.join(ROOT, "assets", "img", slug, n + "-sm.webp")) else "")
    out = []
    # phones: half-width boxes come in pairs; a box left alone in its run goes full width
    span = lambda v: (lambda a, b: int(b) - int(a))(*[x.strip() for x in v.split("/")])
    mob = [c.get("m", 2 if span(c["c"]) >= 2 else 1) for c in cells]
    run = []
    for i, m in enumerate(mob + [2]):
        if m == 1: run.append(i)
        else:
            if len(run) % 2: mob[run[-1]] = 2
            run = []
    for c, m in zip(cells, mob): c["m"] = m
    for c in cells:
        k = c["kind"]
        span = lambda v: (lambda a, b: int(b) - int(a))(*[x.strip() for x in v.split("/")])
        cw, rh = span(c["c"]), span(c["r"])
        assert cw <= 4 or k == "text", f"{slug}: a picture wider than 4 columns"
        m = c.get("m", 2 if cw >= 2 else 1)
        ar = c.get("ar", f"{cw} / {rh}")
        style = f'--c:{c["c"]};--r:{c["r"]};--m:{m};--ar:{ar}'
        pos = f' style="object-position:{c["pos"]}"' if c.get("pos") else ""
        cap = ""   # (owner, Oct 23: no labels on the pictures; "cap" stays in the layouts as a note)
        if k in ("img", "art"):
            n = c["src"]
            if c.get("pad") is not None:
                style += f";--pad-art:{c['pad']}"
            if c.get("bg"):
                style += f";background:{c['bg']}"
            elif k == "art":
                # the panel takes the color of the drawing's own paper, so there's no box-in-a-box
                from PIL import Image
                im = Image.open(os.path.join(ROOT, "assets", "img", slug, small(n) + ".webp")).convert("RGBA")
                w, h = im.size
                px = [im.getpixel((x, y)) for x, y in ((2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3))]
                if min(v[3] for v in px) > 200:   # see-through drawings keep the cream panel
                    bg = tuple(sorted(v[i] for v in px)[1] for i in range(3))
                    style += ";background:#%02x%02x%02x" % bg
            out.append(f'<button type="button" class="b-cell b-{k}" style="{style}" data-full="../assets/img/{slug}/{n}.webp" aria-label="Enlarge: {c["alt"]}">'
                       f'<img src="../assets/img/{slug}/{small(n)}.webp" alt="{c["alt"]}" loading="lazy"{pos}>{cap}</button>')
        elif k == "vid":
            n = c["src"]
            out.append(f'<figure class="b-cell b-vid" style="{style}"><video muted loop playsinline preload="none" data-autoplay poster="../assets/img/{slug}/{n}-poster.webp">'
                       f'<source src="../assets/img/{slug}/{n}.mp4" type="video/mp4"></video>{cap}</figure>')
        elif k == "text":
            ps = "".join(f"<p>{x}</p>" for x in intro_paras)
            facts = "".join(f'<div><dt>{a}</dt><dd>{b}</dd></div>' for a, b in c["facts"])
            out.append(f'<div class="b-cell b-text" style="{style}"><div class="b-copy">{ps}</div><dl class="b-facts">{facts}</dl></div>')
        elif k == "next":
            nx = next_project(slug)
            out.append(f'<a class="b-cell b-next" style="{style}" href="../{nx[4]}"><img src="../{nx[3]}" alt="" loading="lazy">'
                       f'<span class="b-next-label">next project ↗</span><span class="b-next-title">{nx[1]}</span></a>')
    # every box of the 6-column grid is covered exactly once (no holes, no overlaps)
    grid = {}
    for c in cells:
        c0, c1 = [int(x) for x in c["c"].split("/")]; r0, r1 = [int(x) for x in c["r"].split("/")]
        for x in range(c0, c1):
            for y in range(r0, r1):
                assert (x, y) not in grid, f"{slug}: overlap at col {x} row {y}"
                grid[(x, y)] = 1
    holes = [(x, y) for x in range(1, 7) for y in range(1, rows + 1) if (x, y) not in grid]
    assert not holes, f"{slug}: holes at {holes}"
    html = proj_head(title) + f'\n<section class="bento" style="--rows:{rows}">\n' + "\n".join(out) + "\n</section>\n" + after + PAGER
    page(f"projects/{slug}.html", f"{title} | cosmicdroid", desc, html, "work.html", base="../")


# Terp Wizard: both drops on one page (the lab 2026, the cauldron 2023)
bento("terp-wizard", "Terp Wizard", "Merch designs by cosmicdroid for Terp Wizard: the lab and the cauldron.",
      ["Two merch drops for Terp Wizard. <b>The lab</b>: a wizard at his workbench, surrounded by skulls, jars and bubbling flasks, with dripping lettering underneath, on hoodies and tees.",
       "<b>The cauldron</b>: three hooded wizards around a bubbling cauldron, smoke curling all the way up the hood, from red pencil sketches to the print shop."],
      [
        {"kind": "art", "src": "lab-final", "alt": "Terp Wizard: the lab, final art", "c": "1 / 3", "r": "1 / 4", "m": 2, "ar": "778 / 1000", "cap": "the lab · 2026"},
        {"kind": "text", "c": "3 / 5", "r": "1 / 3", "m": 2, "facts": [("type", "merch design"), ("year", "2023 – 2026")]},
        {"kind": "img", "src": "lab-worn-2", "alt": "The lab hoodie, back print", "c": "5 / 7", "r": "1 / 4", "m": 2, "ar": "4 / 5"},
        {"kind": "art", "src": "lab-sketch", "alt": "The lab, pencil sketch", "c": "3 / 4", "r": "3 / 4", "cap": "sketch", "bg": "#fff"},
        {"kind": "img", "src": "lab-worn-1", "alt": "The lab hoodie, front", "c": "4 / 5", "r": "3 / 4", "pos": "center 30%"},
        {"kind": "art", "src": "digital", "alt": "Terp Wizard: the cauldron, final colors", "c": "1 / 3", "r": "4 / 7", "m": 2, "ar": "7 / 10", "cap": "the cauldron · 2023"},
        {"kind": "img", "src": "hoodie", "alt": "The cauldron hoodie in the greenhouse", "c": "3 / 5", "r": "4 / 6", "m": 2, "ar": "1 / 1"},
        {"kind": "art", "src": "sketch-1", "alt": "The cauldron, first pencil sketch", "c": "5 / 6", "r": "4 / 5", "cap": "sketch", "bg": "#fff"},
        {"kind": "art", "src": "sketch-2", "alt": "The cauldron, second pencil sketch", "c": "6 / 7", "r": "4 / 5", "cap": "sketch 2", "bg": "#fff"},
        {"kind": "art", "src": "lineart", "alt": "The cauldron, line art", "c": "5 / 6", "r": "5 / 6", "cap": "line art"},
        {"kind": "img", "src": "print-detail", "alt": "The cauldron print, detail", "c": "6 / 7", "r": "5 / 6"},
        {"kind": "img", "src": "lab-worn-3", "alt": "The lab tee, front", "c": "3 / 4", "r": "6 / 7", "pos": "center 30%"},
        {"kind": "img", "src": "lab-worn-4", "alt": "The lab tee, back print", "c": "4 / 5", "r": "6 / 7"},
        {"kind": "img", "src": "printing", "alt": "The cauldron print, fresh off the press", "c": "5 / 7", "r": "6 / 7", "m": 2, "ar": "2 / 1"},
      ], 6)

# All the Cores and More
bento("all-the-cores", "All the Cores and More", "A shirt design by cosmicdroid for All the Cores and More, who interview artists from the alternative and heavy music scene.",
      ["All the Cores and More is a brand that interviews artists from the alternative and heavy music scene. We teamed up on a merch drop: a shirt with a crest on the front and a full mosh pit of weird little guys on the back.",
       "Every piece here went from a pencil sketch to inked lines to the final art, then onto the shirt."],
      [
        {"kind": "img", "src": "shirts", "alt": "The finished All the Cores and More shirts, front and back", "c": "1 / 3", "r": "1 / 4", "m": 2, "ar": "4 / 5"},
        {"kind": "text", "c": "3 / 5", "r": "1 / 3", "m": 2, "facts": [("type", "merch design"), ("year", "2026")]},
        {"kind": "art", "src": "digital-back", "alt": "Back mosh pit, final digital art", "c": "5 / 7", "r": "1 / 4", "m": 2, "ar": "2 / 3", "cap": "back · final"},
        {"kind": "art", "src": "sketch-front", "alt": "Front crest, first sketch", "c": "3 / 4", "r": "3 / 4", "cap": "front · sketch"},
        {"kind": "art", "src": "process-front", "alt": "Front crest, inked line art", "c": "4 / 5", "r": "3 / 4", "cap": "front · lines"},
        {"kind": "art", "src": "digital-front", "alt": "Front crest, final digital art", "c": "1 / 3", "r": "4 / 5", "m": 2, "ar": "2 / 1", "cap": "front · final"},
        {"kind": "img", "src": "final-front", "alt": "The printed shirt, front", "c": "3 / 4", "r": "4 / 5", "pos": "center 25%"},
        {"kind": "art", "src": "sketch-back", "alt": "Back mosh pit, first sketch", "c": "4 / 5", "r": "4 / 5", "cap": "back · sketch"},
        {"kind": "art", "src": "process-back", "alt": "Back mosh pit, inked line art", "c": "5 / 6", "r": "4 / 5", "cap": "back · lines"},
        {"kind": "img", "src": "final-back", "alt": "The printed shirt, back", "c": "6 / 7", "r": "4 / 5"},
      ], 4)

# Juno mural
bento("juno-mural", "Juno mural", "A mural for Juno, a youth refuge in Villach, Austria, painted by cosmicdroid in 2024.",
      ["A mural for Juno, a non-profit youth refuge in Villach, Austria. I designed and painted it together with a local artist.",
       "The wall was painted over a few days in late May and early June 2024, from a sketch over a photo of the house to the finished piece."],
      [
        {"kind": "img", "src": "hero", "alt": "The finished Juno mural", "c": "1 / 4", "r": "1 / 4", "m": 2, "ar": "1 / 1"},
        {"kind": "text", "c": "4 / 7", "r": "1 / 2", "m": 2, "facts": [("type", "mural"), ("year", "2024")]},
        {"kind": "img", "src": "sketch", "alt": "Juno mural, sketch over a photo of the house", "c": "4 / 7", "r": "2 / 4", "m": 2, "ar": "3 / 2", "cap": "sketch"},
        {"kind": "img", "src": "final-2", "alt": "The finished house, front", "c": "1 / 4", "r": "4 / 6", "m": 2, "ar": "3 / 2"},
        {"kind": "img", "src": "design", "alt": "Juno mural, digital color design", "c": "4 / 7", "r": "4 / 6", "m": 2, "ar": "3 / 2", "cap": "digital design"},
        {"kind": "img", "src": "process-1", "alt": "Juno mural in progress, photo 1", "c": "1 / 2", "r": "6 / 7"},
        {"kind": "img", "src": "process-2", "alt": "Juno mural in progress, photo 2", "c": "2 / 3", "r": "6 / 7"},
        {"kind": "img", "src": "final-1", "alt": "The Juno lettering wall", "c": "3 / 4", "r": "6 / 8", "m": 1, "ar": "1 / 2"},
        {"kind": "img", "src": "final-3", "alt": "The finished house and courtyard", "c": "4 / 7", "r": "6 / 8", "m": 1, "ar": "1 / 2"},
        {"kind": "img", "src": "process-4", "alt": "Juno mural in progress, photo 3", "c": "1 / 2", "r": "7 / 8"},
        {"kind": "img", "src": "process-6", "alt": "Juno mural in progress, photo 4", "c": "2 / 3", "r": "7 / 8"},
      ], 7)


def C(kind, src=None, alt="", c="1 / 2", r="1 / 2", **kw):
    d = {"kind": kind, "src": src, "alt": alt, "c": c, "r": r}
    d.update(kw)
    return d


# Borea (no full-width picture)
bento("borea", "Borea", "Packaging illustration by cosmicdroid for Borea.",
      ["A box for Borea, covered edge to edge in coral, kelp and little hidden creatures. The art wraps around every face, so the box reads as one scene when you turn it in your hands."],
      [
        C("vid", "box", c="1 / 5", r="1 / 3", m=2, ar="16 / 9"),
        C("text", c="5 / 7", r="1 / 3", m=2, facts=[("type", "packaging"), ("year", "2024")]),
        C("img", "cover", "The printed Borea box", c="1 / 3", r="3 / 5", m=1),
        C("art", "flat", "Borea box, the flat colored art", c="3 / 5", r="3 / 5", m=1, cap="color"),
        C("img", "pic-2", "Stacks of finished Borea boxes", c="5 / 7", r="3 / 6", m=2, ar="3 / 4"),
        C("img", "pic-1", "Borea boxes packed in a shipping box", c="1 / 3", r="5 / 7", m=2, ar="7 / 6"),
        C("art", "lineart", "Borea box, line art for each panel", c="3 / 5", r="5 / 7", m=1, cap="line art"),
        C("art", "dieline", "Borea box, color test on the dieline", c="5 / 7", r="6 / 7", m=1, ar="5 / 3", cap="dieline"),
      ], 6)

bento("no-known-weakness", "No Known Weakness", "Album cover art by cosmicdroid for No Known Weakness, Tales From The Clydeside.",
      ["A cover for Tales From The Clydeside: Glasgow's river Clyde overrun by monsters, with the Squinty Bridge, the Finnieston Crane and the Armadillo all getting wrecked.",
       "It started from photos of the real places, then a sketch, line art and the final colors."],
      [
        C("art", "final", "Tales From The Clydeside, final cover", c="1 / 4", r="1 / 4", m=2),
        C("text", c="4 / 7", r="1 / 2", m=2, facts=[("type", "album art"), ("year", "2026")]),
        C("art", "bandcamp", "The EP on Bandcamp", c="4 / 5", r="2 / 4", ar="3 / 5", cap="bandcamp"),
        C("img", "cover", "The singer of No Known Weakness in front of the cover art", c="5 / 7", r="2 / 4", m=1, ar="3 / 5", cap="live"),
        C("art", "references", "Reference photos and first layout", c="1 / 3", r="4 / 6", cap="references"),
        C("art", "sketch", "The sketch", c="3 / 5", r="4 / 6", cap="sketch"),
        C("art", "lineart", "Line art", c="5 / 7", r="4 / 6", m=2, cap="line art"),
      ], 5)

bento("organico", "Orgánico", "Shirt design by cosmicdroid for Orgánico.",
      ["A shirt design for Orgánico: a tiger and a crocodile spiralling through leaves and water, under the motto “menos ego, más alma” (less ego, more soul). Screen printed by hand."],
      [
        C("img", "picture-1", "The Orgánico shirt, back print", c="1 / 3", r="1 / 3", m=2),
        C("text", c="3 / 5", r="1 / 3", m=2, facts=[("type", "shirt design"), ("year", "2023")]),
        C("vid", "process-1", c="5 / 6", r="1 / 3", ar="9 / 16", cap="screen printing"),
        C("vid", "process-2", c="6 / 7", r="1 / 3", ar="9 / 16", cap="the shirt"),
        C("art", "lineart", "Orgánico line art", c="1 / 3", r="3 / 5", m=1, cap="line art"),
        C("art", "final", "Orgánico final colors", c="3 / 5", r="3 / 5", m=1, cap="final"),
        C("img", "picture-2", "The Orgánico shirt, front", c="5 / 7", r="3 / 5", m=2),
      ], 4)

bento("pizzaneta", "Pizzaneta", "Branding and merch by cosmicdroid for Pizzaneta.",
      ["Pizzaneta needed a character to go with the logo, so I drew a pizza wizard chilling in his oven tower with a dragon. It ended up on shirts, tie-dye and all."],
      [
        C("art", "art", "The Let's Munch artwork", c="1 / 4", r="1 / 4", m=2),
        C("text", c="4 / 7", r="1 / 2", m=2, facts=[("type", "mascot + merch"), ("year", "2022")]),
        C("art", "logo", "The Pizzaneta logo", c="4 / 6", r="2 / 3", m=2, ar="2 / 1", cap="logo"),
        C("vid", "promo", c="6 / 7", r="2 / 4", ar="9 / 16"),
        C("img", "cover", "The Let's Munch shirt", c="4 / 5", r="3 / 4"),
        C("img", "shirt-worn", "Tie-dye shirt, front logo", c="5 / 6", r="3 / 4"),
        C("img", "shirt-back", "Cream shirt, back", c="1 / 2", r="4 / 6", ar="9 / 16"),
        C("img", "shirt-blue", "Tie-dye shirt, back", c="2 / 4", r="4 / 6"),
        C("img", "kitchen", "The Pizzaneta team at work", c="4 / 7", r="4 / 6", m=2, ar="3 / 2"),
      ], 5)

bento("sluggore", "Sluggore", "Band merch by cosmicdroid for Sluggore.",
      ["A shirt for Sluggore: a kaiju and a sea serpent locked in a fight on the back, and a sharp chrome logo on the front."],
      [
        C("art", "profile", "Sluggore: a kaiju and a sea serpent fighting", c="1 / 4", r="1 / 4", m=2),
        C("text", c="4 / 7", r="1 / 3", m=2, facts=[("type", "band merch"), ("year", "2024")]),
        C("art", "sketch", "First sketch", c="4 / 5", r="3 / 4", cap="sketch"),
        C("art", "sketch-2", "Refined sketch", c="5 / 6", r="3 / 4", cap="refined"),
        C("art", "lineart", "Final line art", c="6 / 7", r="3 / 4", m=2, cap="line art"),
        C("img", "shirt-back", "The shirt, back", c="1 / 3", r="4 / 6", m=1, ar="3 / 4", cap="back"),
        C("img", "shirt-front", "The shirt, front", c="3 / 5", r="4 / 6", m=1, ar="3 / 4", cap="front"),
        C("vid", "shirt", c="5 / 6", r="4 / 6", ar="9 / 16"),
        C("vid", "shirt-2", c="6 / 7", r="4 / 6", ar="9 / 16"),
      ], 5)

bento("cannabicultores", "Cannabicultores", "Festival poster illustration by cosmicdroid for Cannabicultores 2024 in Manizales, Colombia.",
      ["A tower of little shops, plants and characters for the 2024 Cannabicultores festival, October 19 and 20 in Manizales. The art went on banners, posters and screens around the event."],
      [
        C("art", "illustration", "The full Cannabicultores illustration", c="1 / 3", r="1 / 6", m=2, ar="7 / 12"),
        C("text", c="3 / 7", r="1 / 2", m=2, facts=[("type", "festival poster"), ("year", "2024")]),
        C("vid", "festival", c="3 / 7", r="2 / 4", m=2, ar="16 / 9"),
        C("img", "banner", "The printed banner", c="3 / 5", r="4 / 6", m=1, cap="banner"),
        C("img", "posters", "Posters around town", c="5 / 7", r="4 / 6", m=1, cap="posters"),
        C("art", "sketch", "Cannabicultores, the sketch", c="1 / 3", r="6 / 9", m=2, ar="7 / 10", cap="sketch"),
        C("art", "stickers-2", "Stickers: the characters, sketch and color", c="3 / 7", r="6 / 8", m=2, ar="4 / 3", cap="stickers"),
        C("art", "stickers", "Stickers: the monkey and the astronaut", c="3 / 7", r="8 / 9", m=2, ar="8 / 5"),
      ], 8)

bento("cage-of-destiny", "Cage of Destiny", "Cage of Destiny, a game jam game by cosmicdroid and Ash Badas.",
      ["A short game made for a game jam with Ash Badas: a knight locked in a cage has to escape a lizard king. I drew the characters, items, cutscenes and the title lettering.",
       "Out of the whole jam it ranked #23 for presentation and #34 for enjoyment, 72nd overall with 47 ratings."],
      [
        C("vid", "gameplay", c="1 / 5", r="1 / 4", m=2, ar="4 / 3"),
        C("text", c="5 / 7", r="1 / 3", m=2, facts=[("type", "game art"), ("year", "2023")]),
        C("img", "cover", "Cage of Destiny cover art: a lizard king and a caged knight", c="5 / 7", r="3 / 5", m=2, ar="5 / 4"),
        C("art", "cutscene", "A cutscene: the king, the princess and the lizard", c="1 / 3", r="4 / 6", cap="cutscene"),
        C("art", "sprites", "Characters and items", c="3 / 5", r="4 / 5", ar="8 / 5", cap="sprites"),
        C("art", "title", "Title lettering", c="3 / 5", r="5 / 6", m=2, ar="4 / 1", cap="title"),
        C("art", "ranking", "The jam results", c="5 / 7", r="5 / 6", m=2, ar="2 / 1", cap="results", pad="0px", bg="#111111"),
      ], 5)

bento("brutal-burger-quest", "Brutal Burger Quest", "Game art by cosmicdroid for Brutal Burger Quest: the player, enemies, mage bosses, tiles and effects.",
      ["Brutal Burger Quest is a little game about fighting your way to the ultimate burger. I drew the whole cast: the hero, the creatures that get in the way, a council of burger-hoarding mages, and the tiles and effects that hold the world together."],
      [
        C("text", c="1 / 3", r="1 / 3", m=2, facts=[("type", "game art"), ("year", "2023")]),
        C("vid", "gameplay", c="3 / 7", r="1 / 3", m=2, ar="16 / 9", cap="gameplay"),
        C("art", "cover", "Brutal Burger Quest title art: a horned mage holding a burger", c="1 / 3", r="3 / 5"),
        C("vid", "phone", c="3 / 4", r="3 / 5", ar="9 / 16", cap="phone"),
        C("art", "mages", "Twelve burger mages", c="4 / 7", r="3 / 5", m=2, ar="7 / 5", cap="mages"),
        C("art", "player", "The hero's sprite sheet", c="1 / 4", r="5 / 6", m=2, ar="2 / 1", cap="hero"),
        C("art", "tiles", "Ground and wall tiles", c="4 / 7", r="5 / 6", m=2, ar="2 / 1", cap="tiles"),
        C("art", "enemies", "Enemy sprites: gorilla, bat and beetle", c="1 / 4", r="6 / 8", m=2, ar="4 / 3", cap="enemies"),
        C("art", "extras", "Explosions and breakable blocks", c="4 / 7", r="6 / 8", m=2, ar="4 / 3", cap="effects"),
      ], 7)

bento("botanica-mural", "Botánica mural", "A mural painted by cosmicdroid: a castle tower guarded by dragons and bats.",
      ["A wall I painted from a white sketch to a full castle: bats circling the tower, two dragons climbing it, and a hooded wizard holding the star at the bottom."],
      [C("img", "profile", "The finished Botánica mural", c="1 / 3", r="1 / 6", m=2, ar="9 / 16"),
       C("text", c="3 / 7", r="1 / 2", m=2, facts=[("type", "mural"), ("year", "2022")])]
      + [C("img", f"step-{i}", f"The mural, step {i}", c=f"{2 + i} / {3 + i}", r="2 / 4", ar="9 / 16", cap=f"step {i}") for i in (1, 2, 3)]
      + [C("vid", "timelapse", c="6 / 7", r="2 / 4", ar="9 / 16", cap="timelapse")]
      + [C("img", f"step-{i}", f"The mural, step {i}", c=f"{i - 1} / {i}", r="4 / 6", ar="9 / 16", cap=f"step {i}") for i in (4, 5, 6)]
      + [C("img", "step-7", "The finished mural", c="6 / 7", r="4 / 6", ar="9 / 16", cap="finished")],
      5)

bento("imprint-rolling", "Imprint Rolling", "Branding and packaging illustration by cosmicdroid for Imprint Rolling.",
      ["A set of logos, stickers and packaging art for Imprint Rolling: melting letters, comic panels and a few strange creatures, made to work in one color or in full."],
      [
        C("img", "cover", "Imprint Rolling tubes with the printed art", c="1 / 4", r="1 / 3", m=2, ar="4 / 3"),
        C("text", c="4 / 6", r="1 / 3", m=2, facts=[("type", "branding"), ("year", "2025")]),
        C("art", "art-1", "Imprint Rolling artwork 1", c="6 / 7", r="1 / 2"),
        C("art", "art-2", "Imprint Rolling artwork 2", c="6 / 7", r="2 / 3"),
        C("art", "art-3", "Imprint Rolling artwork 3", c="1 / 3", r="3 / 5", m=2),
        C("art", "art-4", "Imprint Rolling artwork 4", c="3 / 4", r="3 / 4"),
        C("art", "art-5", "Imprint Rolling artwork 5", c="4 / 5", r="3 / 4"),
        C("art", "art-6", "Imprint Rolling artwork 6", c="3 / 4", r="4 / 5"),
        C("art", "art-7", "Imprint Rolling artwork 7", c="4 / 5", r="4 / 5"),
        C("art", "art-8", "Imprint Rolling artwork 8", c="5 / 7", r="3 / 5", m=2),
      ], 4)

bento("big-cats-collection", "Big cats collection", "An illustration series by cosmicdroid: wild cats from around the world, each in its own landscape.",
      [f"A personal series of {len(CATS)} wild cats, from the snow leopard to the tiny sand cat. Each one sits in a landscape from where it lives, drawn with the same flat colors and a background that's all its own.",
       "Everything started as pencil sketches, laid out together so the whole family would feel like one set. Pick a cat below."],
      [
        C("art", "sketches", "Pencil sketches for the big cats series", c="1 / 5", r="1 / 3", m=2, ar="16 / 9", cap="sketches"),
        C("text", c="5 / 7", r="1 / 3", m=2, facts=[("type", "illustration series"), ("year", "2023")]),
      ], 2, after=cats_viewer)

# ---------- new works (Oct 22) ----------
bento("8doce", "8doce", "Illustration by cosmicdroid for 8doce.",
      ["An isometric tower for 8doce, stacked with stairs, little rooms and a garden of plants growing over every ledge, with the logo built into the blocks at the bottom.",
       "It went from a clean line sketch to a colored rough and the final art, then out into the world as a big printed banner."],
      [
        C("art", "final", "8doce, final illustration", c="1 / 3", r="1 / 4", m=2, ar="7 / 10"),
        C("text", c="3 / 7", r="1 / 2", m=2, facts=[("type", "illustration"), ("year", "2024")]),
        C("art", "logo", "The 8doce logo blocks", c="3 / 5", r="2 / 3", m=2, ar="5 / 2", cap="logo"),
        C("img", "printed", "The printed 8doce banner", c="5 / 7", r="2 / 4", m=2, ar="4 / 5", cap="banner"),
        C("art", "sketch", "8doce, line sketch", c="3 / 4", r="3 / 4", ar="7 / 10", cap="sketch"),
        C("art", "sketch-2", "8doce, color rough", c="4 / 5", r="3 / 4", ar="7 / 10", cap="color rough"),
      ], 3)

bento("catacomb", "Catacomb", "Cycling jersey design by cosmicdroid for Catacomb.",
      ["A cycling jersey for Catacomb: a rider on a mechanical dragon across the back, a castle patch on the pocket, thorny emblems and spiky flames on the sleeves and hem, and blackletter lettering across the shoulders.",
       "Every piece was drawn separately so it could be placed on the jersey pattern."],
      [
        C("art", "dragon", "The dragon rider", c="1 / 3", r="1 / 3", m=2, pad="8px"),
        C("text", c="3 / 7", r="1 / 2", m=2, facts=[("type", "jersey design"), ("year", "2026")]),
        C("art", "lettering", "Catacomb lettering", c="3 / 7", r="2 / 3", m=2, ar="4 / 1"),
        C("art", "jersey-front", "The front of the jersey", c="1 / 3", r="3 / 6", m=1, ar="3 / 4", cap="front", pad="8px"),
        C("art", "jersey-back", "The back of the jersey", c="3 / 5", r="3 / 6", m=1, ar="3 / 4", cap="back", pad="8px"),
        C("art", "mockup", "The Catacomb jersey, front and back", c="5 / 7", r="3 / 4", m=2, ar="2 / 1", pad="6px"),
        C("art", "castle-label", "The castle patch", c="5 / 6", r="4 / 5", cap="castle"),
        C("art", "front-label", "The front label", c="6 / 7", r="4 / 5", cap="label"),
        C("art", "sleeve", "Sleeve pattern", c="5 / 6", r="5 / 6", cap="sleeve", pad="8px"),
        C("art", "emblem-red", "The thorn emblem", c="6 / 7", r="5 / 6", cap="emblem"),
      ], 5)

bento("westword", "Westword", "Editorial illustration by cosmicdroid for Westword's Mile High Monster Mash.",
      ["The Mile High Monster Mash issue of Westword: a cover full of monsters heading to the show, and a poster for each Denver venue in the concert calendar, from Red Rocks to the Bluebird.",
       "Everything came to life in an animated version too."],
      [
        C("text", c="1 / 3", r="1 / 3", m=2, facts=[("type", "editorial illustration"), ("year", "2025")]),
        C("img", "cover-art", "Westword cover: Mile High Monster Mash", c="3 / 5", r="1 / 3", m=1, ar="7 / 8", pos="top", cap="cover"),
        C("vid", "video", c="5 / 7", r="1 / 5", m=1, ar="9 / 16"),
        C("img", "red-rocks", "Red Rocks poster", c="1 / 3", r="3 / 5", ar="7 / 8", pos="top"),
        C("img", "ogden", "Ogden Theatre poster", c="3 / 5", r="3 / 5", ar="7 / 8", pos="top"),
        C("img", "mission-ballroom", "Mission Ballroom poster", c="1 / 3", r="5 / 7", ar="7 / 8", pos="top"),
        C("img", "gothic", "Gothic Theatre poster", c="3 / 5", r="5 / 7", ar="7 / 8", pos="top"),
        C("img", "bluebird", "Bluebird Theater poster", c="5 / 7", r="5 / 7", m=2, ar="7 / 8", pos="top"),
      ], 6)

bento("gamehendge", "Gamehendge", "Festival merch by cosmicdroid for Gamehendge: two shirts, a cast of characters and stickers.",
      ["Two shirts for Gamehendge. <b>Summer Tour 2024</b>: a wizard on his throne in the depths of Gamehendge, with a crew of characters around him, printed on tie-dye.",
       "<b>On the Road to Gamehendge</b> (Commerce City, Colorado, 2023): a wagon full of travellers on the way to the castle. Each character also became its own sticker."],
      [
        C("img", "2023-worn", "A fan wearing the Gamehendge shirt", c="1 / 3", r="1 / 4", m=2, ar="4 / 5"),
        C("text", c="3 / 5", r="1 / 3", m=2, facts=[("type", "festival merch"), ("year", "2023 – 2024")]),
        C("art", "2024-art", "Gamehendge Summer Tour 2024, final art", c="5 / 7", r="1 / 4", m=2, ar="3 / 4", cap="summer tour · 2024"),
        C("art", "2024-lineart", "2024, line art", c="3 / 4", r="3 / 4", cap="line art"),
        C("img", "2024-mockup", "2024 shirts and characters", c="4 / 5", r="3 / 4"),
        C("art", "2024-characters", "The 2024 characters", c="1 / 4", r="4 / 6", m=2, ar="3 / 2", cap="characters"),
        C("vid", "video", c="4 / 5", r="4 / 6", ar="9 / 16", cap="printing"),
        C("img", "2024-tiedye", "The 2024 tie-dye shirt", c="5 / 7", r="4 / 6", m=1),
        C("art", "2023-art", "On the Road to Gamehendge, final art", c="1 / 3", r="6 / 9", m=2, ar="3 / 4", cap="on the road · 2023"),
        C("img", "2023-tiedye", "The 2023 tie-dye shirts", c="3 / 5", r="6 / 9", m=2, ar="4 / 5"),
        C("art", "2023-sketch", "2023, line art", c="5 / 6", r="6 / 8", ar="2 / 3", cap="line art"),
        C("art", "2023-characters-sketch", "2023 characters, sketches", c="6 / 7", r="6 / 8", ar="2 / 3", cap="characters"),
        C("art", "colonel", "Colonel Forbin", c="5 / 6", r="8 / 9"),
        C("art", "rutherford", "Rutherford the Brave", c="6 / 7", r="8 / 9"),
        C("img", "stickers-colonel", "Colonel Forbin stickers", c="1 / 3", r="9 / 11", m=1, cap="stickers"),
        C("img", "stickers-rutherford", "Rutherford the Brave stickers", c="3 / 5", r="9 / 11", m=1),
        C("art", "lizards", "The Lizards", c="5 / 6", r="9 / 10"),
        C("art", "multibeast", "The Multi-beast", c="6 / 7", r="9 / 10"),
        C("img", "stickers-lizards", "The Lizards stickers", c="5 / 6", r="10 / 11"),
        C("img", "stickers-multibeast", "Multi-beast stickers", c="6 / 7", r="10 / 11"),
      ], 10)


bento("localsonly", "Locals Only", "Merch design by cosmicdroid for Locals Only.",
      ["A cartoon cat lineman for Locals Only, made for the crews who keep the power on: hard hat, rubber gloves, bucket truck and a lightning bolt to ride.",
       "Shirts and stickers, plus a design for the 2025 Lineman's Rodeo, each one going from a quick sketch to the final art."],
      [
        C("art", "rodeo", "Lineman's Rodeo 2025: the cat up a power pole", c="1 / 3", r="1 / 3", m=2, pad="6px"),
        C("text", c="3 / 7", r="1 / 2", m=2, facts=[("type", "merch design"), ("year", "2025")]),
        C("art", "union-made", "Union made, Locals Only: the cat lineman and a rat", c="3 / 5", r="2 / 4", m=2),
        C("art", "truck", "The cat in a bucket truck", c="5 / 7", r="2 / 3", m=2, ar="2 / 1"),
        C("art", "pole-nap", "The cat napping under a Locals Only power pole", c="5 / 6", r="3 / 4"),
        C("art", "sketch-pole", "Sketch for the napping cat", c="6 / 7", r="3 / 4", cap="sketch"),
        C("art", "gloves", "The cat in his rubber gloves", c="1 / 2", r="3 / 5", ar="1 / 2"),
        C("art", "glove-sign", "A gloved hand making the Locals Only sign", c="2 / 3", r="3 / 5", ar="1 / 2"),
        C("art", "sketch-rodeo", "Sketch for the Lineman's Rodeo design", c="3 / 4", r="4 / 5", cap="sketch", pad="4px"),
        C("art", "sketch-union", "Sketch for the Union made design", c="4 / 5", r="4 / 5", cap="sketch", pad="4px"),
        C("art", "bolt", "The cat riding a lightning bolt", c="5 / 7", r="4 / 5", m=2, ar="2 / 1"),
      ], 4)

bento("jfgprintco", "JFGprintco", "Illustration, a mural and a crew of corgi characters by cosmicdroid for JFG Print Co.",
      ["A whole world of corgis for JFG Print Co, a screen printing and embroidery shop: a big mural inside the shop, window art for the storefront, stickers, packaging and a crew of corgi characters for their website and merch.",
       "Every piece went from pencil to clean lines to color, and the corgis now show up all over the shop, from the boxes to the camera sign."],
      [
        C("img", "profile", "The JFG Print Co storefront with the window art at night", c="1 / 3", r="1 / 3", m=2),
        C("text", c="3 / 7", r="1 / 2", m=2, facts=[("type", "branding + mural"), ("year", "2025")]),
        C("art", "mural-art", "The JFG mural: corgis on a quest through the mountains", c="3 / 7", r="2 / 4", m=2, ar="2 / 1", pad="0px", cap="mural"),
        C("art", "mural-lines", "Line art for the mural", c="1 / 3", r="3 / 4", m=2, ar="2 / 1", cap="mural · lines"),
        C("img", "mural-photo", "The finished mural in the shop", c="1 / 4", r="4 / 6", m=2, ar="3 / 2"),
        C("art", "window-1", "Window art: corgis at the screen printing press", c="4 / 7", r="4 / 6", m=2, ar="3 / 2", pad="0px", cap="windows"),
        C("art", "window-2", "Window art: corgis at the embroidery machines", c="1 / 4", r="6 / 8", m=2, ar="3 / 2", pad="0px"),
        C("art", "window-lines", "Line art for the windows", c="4 / 7", r="6 / 8", m=2, ar="3 / 2", cap="windows · lines"),
        C("img", "window-photo", "The embroidery window at night", c="1 / 4", r="8 / 10", m=2, ar="3 / 2"),
        C("img", "window-sticker", "A corgi peeking over the window into the shop", c="4 / 7", r="8 / 10", m=2, ar="3 / 2"),
        C("img", "shop-corgi", "A real corgi in front of the windows", c="1 / 3", r="10 / 12"),
        C("img", "box", "A JFG shipping box with the corgi print", c="3 / 5", r="10 / 12"),
        C("img", "camera-sign", "The 'Smile! You're on camera' sign", c="5 / 7", r="10 / 12", m=2),
        C("art", "character-sketches", "Character sketches: corgis in every job", c="1 / 4", r="12 / 14", m=2, ar="3 / 2", cap="sketches"),
        C("art", "sports-team", "The corgi sports team", c="4 / 7", r="12 / 14", m=2, ar="3 / 2", pad="0px"),
        C("art", "scene-tailor", "Corgis at the tailor's", c="1 / 4", r="14 / 16", m=2, ar="3 / 2", pad="0px"),
        C("art", "scene-office", "Corgis at the office", c="4 / 7", r="14 / 16", m=2, ar="3 / 2", pad="0px"),
        C("art", "scene-school", "Corgis at school", c="1 / 4", r="16 / 18", m=2, ar="3 / 2", pad="0px"),
        C("art", "stickers-sketch", "Sticker sketches", c="4 / 5", r="16 / 18", ar="1 / 2", cap="sketch"),
        C("art", "stickers-color", "The finished stickers", c="5 / 7", r="16 / 18", cap="stickers"),
        C("art", "bouncer", "The bouncer corgi, sketch and color", c="1 / 2", r="18 / 19"),
        C("art", "thumbs-up", "Thumbs-up corgi, sketch and color", c="2 / 3", r="18 / 19"),
        C("art", "camera", "Camera corgi, sketch and color", c="3 / 4", r="18 / 19"),
        C("art", "web-heart", "A happy corgi with a heart", c="4 / 5", r="18 / 19", pad="6px"),
        C("art", "web-math", "A corgi doing the math", c="5 / 6", r="18 / 19", pad="6px"),
        C("art", "web-custom", "A corgi with a custom design shirt", c="6 / 7", r="18 / 19", pad="6px"),
        C("art", "pro-graduation", "Graduate corgi", c="1 / 2", r="19 / 21", ar="1 / 2", pad="6px"),
        C("art", "pro-student", "Student corgi", c="2 / 3", r="19 / 21", ar="1 / 2", pad="6px"),
        C("art", "pro-coach", "Coach corgi", c="3 / 4", r="19 / 21", ar="1 / 2", pad="6px"),
        C("art", "pro-painter", "Painter corgi", c="4 / 5", r="19 / 21", ar="1 / 2", pad="6px"),
        C("art", "pro-softball", "Softball corgi", c="5 / 6", r="19 / 21", ar="1 / 2", pad="6px"),
        C("art", "pro-builder", "Builder corgi", c="6 / 7", r="19 / 21", ar="1 / 2", pad="6px"),
        C("art", "pro-soccer", "Soccer corgi", c="1 / 2", r="21 / 22", pad="6px"),
        C("art", "web-pack", "A pack of corgis", c="2 / 3", r="21 / 22", pad="6px"),
        C("art", "web-search", "A corgi with a magnifying glass", c="3 / 4", r="21 / 22", pad="6px"),
        C("art", "web-computer", "A corgi designing on the computer", c="4 / 5", r="21 / 22", pad="6px"),
        C("art", "web-two-weeks", "Two weeks later: from design to finished shirts", c="5 / 7", r="21 / 22", m=2, ar="2 / 1", pad="6px"),
      ], 21)






print("ok")
