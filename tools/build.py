import os, re
# Builds the HTML pages in ../site from the templates below.
# Run from anywhere:  python3 tools/build.py
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Space+Mono:wght@400;700&family=Pirata+One&family=VT323&display=swap">')

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
        <p class="intro-keys">← → to steer, space to lick<br>phones: tilt, tap the tongue</p>
        <p class="intro-keys">best: <span data-best>0</span></p>
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
ICON_IG = '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="2" y="2" width="24" height="24" rx="6" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="14" cy="14" r="5.6" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="21" cy="7" r="1.6" fill="currentColor"/></svg>'
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
<body data-base="{base}">
<div class="loader" id="loader" aria-hidden="true">
  <div class="loader-inner">
    <span class="runner"></span>
    <span class="loader-ground"></span>
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

TICK = ticker(["illustration", "murals", "animation", "branding", "character design", "merch", "painting walls worldwide"])


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
rooms = [("work.html", "Library", "my work", ""), ("murals.html", "Mural studio", "murals", ""),
         ("index.html#play", "Arcade", "play Frog Jump", " data-play-frogjump"), ("about.html", "My room", "about me", ""),
         ("contact.html", "Post room", "contact", "")]
room_list = "\n".join(
    f'      <li><a href="{h}"{x} data-room-art="room-{i + 1}"><span class="room-art" aria-hidden="true"><span class="runner room-runner"></span></span><span class="num">0{i + 1}</span><b>{r}</b><span class="what">{w}</span><span class="arrow" aria-hidden="true">↗</span></a></li>'
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
loops = "\n".join(f'    <figure class="cell-fig">{slot(f"work-loop-{i}", "800×800 loop", alt=f"Animated loop {i}")}</figure>' for i in range(1, 4))

works = page_head("Works", "Murals, illustration, branding, characters and merch, for clients and side quests. Hover a card to open it.") + f'''
<section class="block">
  {filters}
  <div class="deck deck-tall" data-deck="all"></div>
</section>
<section class="block">
  {bar("Loops")}
  <div class="cells cells-3">
{loops}
  </div>
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
lk_gal = "\n".join(
    f'    <button type="button" aria-label="Enlarge photo {i}"><img src="assets/img/leapkill/0{i}.jpg" alt="{alt}" loading="lazy" width="800" height="1000"></button>'
    for i, alt in [(1, "Leap Kill vol. 01 with stickers"), (2, "The Leap Kill pack: comic, stickers and videogame"), (3, "A pile of Leap Kill holographic stickers")])
lk_sprites = "\n".join(
    f'    <figure class="sprite-cell"><span class="sprite sprite-{k}" role="img" aria-label="The Leap Kill guy, {k}"></span><figcaption><span class="num">0{i + 1}</span>{k}</figcaption></figure>'
    for i, k in enumerate(["idle", "run", "attack"]))
lk_world = "\n".join(f'    <figure class="cell-fig">{slot(f"leapkill-world-{i}", "800×800", alt=f"Leap Kill world {i}")}</figure>' for i in range(1, 4))
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
      <div><dt>by</dt><dd>cosmicdroid</dd></div>
    </dl>
  </div>
</section>
{ticker(["leap kill", "vol. 01", "comic", "holographic stickers", "videogame", "by cosmicdroid"])}

<section class="block">
  {bar("The hero")}
  <div class="lk-hero-row">
    <div class="cells cells-3 sprite-cells">
{lk_sprites}
    </div>
    <div class="pad-cell prose lk-bio">
      <p class="placeholder-note">Add his name and a few lines about him: who he is, what he wants, why he's so angry.</p>
      <p>He's the one running around the castle on the homepage. These are his sprites from the Leap Kill videogame.</p>
    </div>
  </div>
</section>
<section class="block">
  {bar("Vol. 01")}
  <div class="gallery lk-gallery">
{lk_gal}
  </div>
</section>
<section class="block">
  {bar("The world")}
  <div class="cells cells-3">
{lk_world}
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
  <div class="split-cell">{slot("about-portrait", "800×1000", ratio="4 / 5", alt="cosmicdroid painting a wall")}</div>
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
    <h2>Hire me for</h2>
    <ul class="tag-list">
      <li>murals</li><li>illustration</li><li>branding &amp; logos</li><li>merch</li>
      <li>album &amp; poster art</li><li>animation</li><li>character design</li><li>paintings</li>
    </ul>
  </div>
</section>
<section class="block">
  {bar("In the studio")}
  <div class="pad-cell">{slot("about-studio", "16:9, 1280×720", ratio="16 / 9", alt="In the studio")}</div>
</section>
''' + cta()
page("about.html", "About | cosmicdroid", "About cosmicdroid, illustrator, animator and muralist based in Colombia.", about, "about.html")

# ---------- CONTACT ----------
contact = page_head("Contact", "Tell me about your wall, brand or idea. I usually reply within a few days.") + f'''
<section class="split">
  <div class="split-cell">
    <form class="form" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-contact>
      <input type="hidden" name="form-name" value="contact">
      <p class="hidden-field"><label>Leave this empty <input name="bot-field" id="bot-field"></label></p>
      <div class="form-row">
        <div class="field"><label for="name">Name</label><input id="name" name="name" type="text" autocomplete="name" required></div>
        <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
      </div>
      <div class="form-row">
        <div class="field">
          <label for="type">What do you need?</label>
          <select id="type" name="type">
            <option>Mural</option>
            <option>Illustration</option>
            <option>Branding / logo</option>
            <option>Merch design</option>
            <option>Album or poster art</option>
            <option>Animation</option>
            <option>Character design</option>
            <option>Painting</option>
            <option>Something else</option>
          </select>
        </div>
        <div class="field"><label for="where">Where (for murals)</label><input id="where" name="where" type="text" placeholder="City, country"></div>
      </div>
      <div class="field"><label for="message">Tell me about it</label><textarea id="message" name="message" required placeholder="The idea, size or format, timeline, budget if you have one"></textarea></div>
      <div><button class="button" type="submit">Send message <span aria-hidden="true">↗</span></button></div>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
  <aside class="split-cell contact-aside">
    {slot("contact-critter", "400×400", alt="", style="max-width:240px")}
    <div>
      <h2>Email</h2>
      <p class="big">cosmicdroidworld@gmail.com</p>
    </div>
    <div>
      <h2>Instagram</h2>
      <p class="big"><a href="https://www.instagram.com/cosmicdroid/" rel="noopener">@cosmicdroid</a></p>
    </div>
    <div>
      <h2>Murals abroad</h2>
      <p>I'm based in Colombia and travel for murals. Tell me the city and rough dates.</p>
    </div>
  </aside>
</section>
'''
page("contact.html", "Contact | cosmicdroid", "Commission a mural, illustration, branding or animation from cosmicdroid.", contact, "contact.html")

# ---------- JUNO ----------
gal = "\n".join(
    f'    <button type="button" aria-label="Enlarge photo {i}"><img src="../assets/img/juno-mural/{i:02d}.jpg" alt="Juno mural, photo {i}" loading="lazy" width="800" height="600"></button>'
    for i in range(1, 10))
juno = page_head("Juno mural", "A mural for Juno, a non-profit youth refuge in Villach, Austria. I designed and painted it together with a local artist.",
                 extra='<p class="crumb"><a href="../work.html">← all works</a></p>') + f'''
<section class="block">
  <figure class="project-hero">
    <img src="../assets/img/juno-mural/hero.jpg" alt="The finished Juno mural" width="1600" height="1000">
  </figure>
  <dl class="facts">
    <div><dt>client</dt><dd>Juno youth refuge</dd></div>
    <div><dt>location</dt><dd>Villach, Austria</dd></div>
    <div><dt>year</dt><dd>2024</dd></div>
    <div><dt>size</dt><dd class="todo">add size</dd></div>
    <div><dt>with</dt><dd class="todo">add artist name</dd></div>
  </dl>
  <div class="pad-cell prose">
    <p class="placeholder-note">Add a few lines about the idea and the process.</p>
    <p>The wall was painted over a few days in late May and early June 2024. The photos below follow it from the first sketch lines to the finished piece.</p>
  </div>
</section>
<section class="block">
  {bar("Timelapse")}
  <div class="pad-cell">{slot("juno-timelapse", "16:9 video .mp4", ratio="16 / 9", alt="Juno mural timelapse")}</div>
</section>
<section class="block">
  {bar("Process")}
  <div class="gallery">
{gal}
  </div>
</section>
<section class="pager">
  <a href="../work.html">← all works</a>
  <a href="../contact.html">paint something with me ↗</a>
</section>
'''
page("projects/juno-mural.html", "Juno mural | cosmicdroid", "A mural for Juno, a youth refuge in Villach, Austria, painted by cosmicdroid in 2024.", juno, "work.html", base="../")
print("ok")
