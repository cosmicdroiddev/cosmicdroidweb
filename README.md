# cosmicdroid.com

The portfolio of **cosmicdroid**: a playable castle homepage, works, murals, the Leap Kill comic, about and contact.

- **Website files:** `site/` (this is what goes online)
- **Page generator:** `tools/build.py` → run `python3 tools/build.py` after changing page content
- **Hosting:** Netlify, publishing the `site/` folder (see `netlify.toml`)
- **Notes for Claude:** `CLAUDE.md`

Quick edits you can make right on github.com: projects in `site/js/projects.js`, images/GIFs in `site/js/media.js`, frog facts in `site/js/main.js`.

---

_All file paths below are inside `site/`._

# cosmicdroid.com

Plain HTML, CSS and JavaScript. No build step, no framework.

## Files

```
index.html            Home (the playable castle + featured work)
murals.html           All murals
work.html             Illustration, branding, merch
frog.html             The Frog universe
about.html            Bio, studies, services
contact.html          Contact form
projects/             One page per project (juno-mural.html is the template)
css/style.css         All the styling. Colors and fonts are at the top.
js/projects.js        THE PROJECT LIST. Edit this to add or change projects.
js/main.js            Builds the grids, the lightbox and the form
js/castle.js          The playable castle on the homepage
js/game.js            Frog Jump (opens from the castle's arcade)
js/media.js           Paths for every GIF / animation slot
assets/img/           Images, one folder per project
```

## Replace the placeholder images

Every image right now is a colored placeholder. Drop your real files in with the same names:

- `assets/img/hero.jpg` – the big sticker image on the homepage (portrait, about 800×1000)
- `assets/img/me.jpg` – your photo for About
- `assets/img/frog/frog.jpg` – Frog art
- `assets/img/<project>/cover.jpg` – square cover for each project (about 1200×1200)
- `assets/img/juno-mural/hero.jpg` and `01.jpg` to `09.jpg` – Juno photos

Export JPGs around 1600px on the long side and 80% quality so pages stay fast.

## Add a project

1. Make a folder `assets/img/my-project/` and put `cover.jpg` in it.
2. Add an entry to `js/projects.js` (copy an existing one).
3. Optional: copy `projects/juno-mural.html` to `projects/my-project.html`, change the text and image names, and set `page: "projects/my-project.html"` in the entry.

## Put it online (Netlify, free)

1. Create a free account at netlify.com.
2. Drag this whole folder onto the Netlify dashboard ("Deploy manually"). It goes live on a netlify.app address.
3. In Site settings → Domain management, add `cosmicdroid.com` and follow the DNS steps for wherever your domain is registered.
4. The contact form works automatically on Netlify. Submissions appear under Forms in the dashboard; turn on email notifications there.

Before pointing the domain, export anything you want to keep from WordPress.

## Things marked to check

- Entries in `js/projects.js` marked `CHECK` came from the old site; confirm the tag, year and location.
- About bio is a draft.
- Juno page: add the mural size, the collaborating artist's name, and a few lines about the idea.

## The homepage castle

The homepage opens on a castle you can explore. The Frog walks between six rooms, and each room has a glowing thing that opens part of the site:

| Room | Glowing thing | Opens |
|---|---|---|
| Library | book on the lectern | Work |
| Mural studio | the mural and paint | Murals |
| Arcade | TV and console | Frog Jump (the game) |
| My room | drum kit | About |
| Great hall | bounty board | The Frog |
| Post room | crow on the mailbox | Contact |

People who don't want to play can click or tap any glowing thing directly, or use the list next to the castle.

**Controls.** Computer: ← → or A/D to walk, space/Z/↑/W to jump, ↑/W/E/Enter at a glowing thing to go in, ↓/S to drop through wooden floors. Phone: the ◄ ► enter jump buttons under the castle. The keyboard only steers the Frog while the castle is on screen, so the page scrolls normally once you move past it.

**Getting around.** Wooden trapdoors in each ceiling lead up (stand on the shelf under them and jump). Holes in the floors lead down. The bed is bouncy.

**Traps and mobs.** Spikes in the post room, a swinging mace in the mural studio, a slime in the hall, a spider in the library and a bat on the roof. Land on mobs to pop them (they come back after a few seconds). If the Frog gets hit he poofs and reappears in the last room he stood in.

### Changing it (all in `js/castle.js`)

- `CASTLE_SPOTS`: where each glowing thing is and what it opens.
- `CASTLE_ART`: your own drawings. The castle drawing should be 720×1200 px (2× the 360×600 playfield) with a transparent sky. Use the two templates in `assets/castle/` to draw over:
  - `castle-layout.png` is the current placeholder castle.
  - `castle-collision.png` shows the grid: blue = stone, cyan = wooden planks and shelves, pink boxes = the glowing spots. Keep walls and floors where they are and the game keeps working.
  - Sprites for the Frog, slime, bat and spider can be swapped too (sizes are listed in the file).
  - Set `drawnDetails: false` if your drawing includes its own TV screen, sleeping cat, torches and so on.
  - `title` controls the "cosmicdroid portfolio" lettering behind the castle.
- `MAP`: the layout itself, one line per row (`#` stone, `=` plank or shelf, space = open).
- `F`: how the Frog moves (jump height, speed, gravity).

For testing in the browser console: `castle.put(10, 14)` moves the Frog to a column and floor row.

## The intro game: Frog Jump, the haunted castle

**On hold:** Frog Jump no longer opens by itself. It opens from the TV in the castle's arcade, from "Arcade" in the list next to the castle, or from a link to `index.html#play`. The code is untouched; to bring back the automatic intro, see the note at the bottom of `js/game.js`.

A Doodle Jump-style game: the Frog climbs a haunted castle floor by floor.

- Best score is saved in the visitor's browser.

### Controls

- Computer: arrow keys or A/D to steer. Space, ↑ or W (or a mouse click) sticks out the tongue. Esc skips to the site.
- Phone: tilt to steer (iPhones ask once, when you tap Play), or hold the left/right side of the screen. The pink "lick" button under the game sticks out the tongue.

### The castle

Each floor adds something new, and the gaps between ledges keep growing, like Doodle Jump.

| Floor | Starts at | New things |
|---|---|---|
| The Dungeon | 0 | stone ledges, rotten planks, mushrooms, first ghost, bat wings |
| The Great Hall | 700 | ghost skateboards that slide, bats, Ciruela |
| The Library | 1800 | ectoplasm planks, chandeliers that ride up and down, cursed crates, spiders, skull lantern |
| The Bell Tower | 3200 | the Maw, more of everything |
| The Rooftops | 5000 | open night sky, the hardest mix |

**Platforms:** stone ledge (normal), ghost skateboard (slides), chandelier (moves up and down), ectoplasm plank (vanishes after one bounce), rotten plank (breaks, no bounce), cursed crate (lights up when it appears and explodes about 2.5 s later).

**Monsters:** ghost, bat and spider. Land on them from above or hit them with the tongue for points. Touching them any other way knocks the Frog out. The Maw is a toothy hole that pulls you in and can't be killed, so steer around it.

**Power-ups:** mushroom (big bounce), bat wings (fly up for a moment), Ciruela (carries the Frog up fast, like a jetpack), skull lantern (shield that absorbs one hit). Flies are worth 25 points; touch them or lick them.

**Score:** height climbed plus bonuses (flies 25, licked monster 75, stomped monster 100).

### Changing things

All in `js/game.js`:

- `GAME_ASSETS` at the top: paths to your own PNG sprites for the Frog, every platform, power-up and monster. Anything left as `null` uses the drawn placeholder.
- `GAME_FEEL`: gravity, jump, run speed, slipperiness, tilt range, power-up speeds and durations, tongue reach.
- `FLOORS`: each floor's name, wall colors, wall decorations, and the odds of each platform, trap, monster and power-up. Change `at` to make a floor start earlier or later.

For testing in the browser console: `frogJump.warp(3300)` jumps to a height, `frogJump.god = true` makes the Frog unable to lose.

## GIF and animation slots

Every spot meant for a GIF, animation or video is a "slot". They show as dashed placeholders with their name and suggested size until you fill them.

1. Put your file in `assets/media/` (GIF, PNG, WebP, JPG, MP4 or WebM).
2. Open `js/media.js` and write the path next to the slot's name, e.g. `"bestiary-1": "assets/media/skull-slug.gif"`.

Videos play muted and on loop, like GIFs. For anything longer than a few seconds, MP4 is much lighter than GIF.

Where the slots are:

- **Home:** a critter peeking over "Selected work", an icon per service, "The bestiary" (6 small loops), "Moving pictures" reel
- **Murals:** timelapse
- **Work:** three loops
- **The Frog:** the Frog, small portraits of the Frog and Ciruela, a comic page or animatic
- **About:** portrait, studio/drumming video
- **Contact:** a critter next to the form
- **Every page:** a tiny friend in the footer
- **Juno:** timelapse

To remove a slot you don't want, delete its `<figure data-slot="…">` from the page.

## The square grid design (Oct 2026)

- Every page sits on a grid of thin cobalt lines with square cells. Colors and fonts are tokens at the top of `css/style.css` (`--paper`, `--line`, `--violet`, `--lime`, `--cyan`; Archivo for headings and the wordmark, Space Mono for small text).
- Menu: **Works / About / Contact**. Murals live inside Works (filter "Murals"), on `murals.html`, and in the castle's mural studio.
- **Works deck**: cards sit side by side; the one you point at opens wide. On phones the cards swipe sideways. Cards come from `js/projects.js` (`featured: true` shows them on the homepage; `type` drives the filters).
- **Your logo**: `assets/img/logo-icon.png` (wizard frog, from pp.PNG) and `assets/img/logo-wordmark.png` (from cosmicdroid_text.png), set in `js/media.js` as `"logo-icon"` and `"logo-wordmark"`. Swap the files to change them.
- Phones (760px and under): 64px header with a violet menu button, castle full screen first, then the rest of the page.
- **Leap Kill**: `leapkill.html` is the page for your comic and its world, opened from the Leap Kill box on the homepage. Images in `assets/img/leapkill/`; world slots `leapkill-world-1..3` in `js/media.js`.
- **Room rows (homepage)**: hover a row and it doubles in height with a little guy walking across. Set your own animated frog per room in `js/media.js` (`"room-1"` … `"room-5"`).
- **Castle hero**: your Leap Kill sprites (idle, run, attack from `leapkill/*.gif`) live in `assets/castle/hero-sheet.png`, a strip of 96×96 frames. `CASTLE_ART.hero` in `js/castle.js` sets which frames are which, the speed and the size.
- **Leap Kill reader**: `js/flipbook.js` + `css/flipbook.css` turn the pages in the "Read Vol. 01" section of `leapkill.html` into a book. Pages are `assets/img/leapkill/book/01.jpg`–`16.jpg` (900×1386); to add or reorder pages, edit the list of `<div class="lk-page">` images in that section. Wide screens show spreads, phones one page at a time.
- **Drawing your own castle**: draw on top of `assets/castle/castle-silhouette.png` (1440×2400, transparent; `castle-silhouette-guides.png` labels the solid stone, wood planks, doors, bed, spikes, mace and the part the page shows). Keep walls and planks where they are, since the game uses them for collisions. Export a transparent PNG at the same size, put it in `assets/castle/`, and set `castle:` in `CASTLE_ART` at the top of `js/castle.js`.
- **Castle memory**: when you go into a room and come back, the frog is where you left him (kept for the browser session).
