# cosmicdroid.com — notes for Claude

Portfolio of cosmicdroid (illustrator, animator, muralist from Colombia). Static site, no framework, no build step to deploy: `site/` is published as-is by Netlify (`netlify.toml`).

## Layout
- `site/` — the website. Pages: index (castle game + home), work, about, contact, leapkill (the Frog page was removed Oct 27, the Murals page Oct 29) (comic + flipbook reader), projects/juno-mural.
- `tools/build.py` — generates every `site/*.html` page (header, footer, nav and all page content live here). **Edit page HTML here, then run `python3 tools/build.py`.** Don't hand-edit the generated HTML; it gets overwritten.
- `tools/webimg.py` — turns big originals into light WebP (`NAME.webp` for zoom + `NAME-sm.webp` for the page). Use it for every new image; never commit print-size files.
- Project pages are built in `tools/build.py` with `project()` + `intro()` / `gallery()`, or (new, Oct 2026) with `bento()`: a Leap Kill-style grid of boxes that fit together with no gaps — now used for every work page (layouts are checked for holes/overlaps at build time; no picture wider than 4 of the 6 columns); images go in `site/assets/img/<slug>/`. Only use files with real names (sketch, process, final…) from the owner's folders, never `Untitled_Artwork`/`IMG_` ones.
- `tools/castle_trace.py` — after the owner redraws the castle: traces walls/planks from the drawing into MAP for castle.js (planks also need their exact tops in PLANKS).
- Castle traps (spider, spike ball, spikes, snake idle/attack, knight helmet): frames from the owner's `castle_assets.psd`, one strip per animation in `site/assets/castle/traps/`; positions/hitboxes in `TRAPS` in castle.js (PSD canvas = the castle drawing canvas, castle starts at 268,320 px, 1100 px = 360 world units). The old drawn traps were erased from `castle.webp`. Spike ball swings on a chain, spider drops on a web thread every 4 s, snake strikes only after the frog stands in reach 1 s; spider, snake and knight can be stomped.
- `tools/castle_template.py` — makes the castle drawing templates in `site/assets/castle/`.
- `site/css/style.css` — all styles. Later rules intentionally override earlier ones; append overrides at the end with a comment saying what they do.
- `site/js/castle.js` — the playable castle (map, physics, rooms/doors, mobs, phone stick + buttons, frog position memory). `site/js/arcade.js` — opens the Leap Kill videogame (`site/games/leapkill/`, a GDevelop export; how to update it: `tools/game/README.md`) in a full-screen window from the castle TV, the home Arcade link, the Leap Kill page and `#play` links. Frog Jump (old game.js) was replaced by it in Oct 2026; it's in git history.
- `site/js/main.js` — media slots, works deck, loader, footer frog facts, header color on scroll, etc. `site/js/media.js` — paths for every image/GIF slot. `site/js/projects.js` — the project list.
- `site/js/flipbook.js` + `site/css/flipbook.css` — Leap Kill reader (custom; flat pages + one 3D turning sheet; spreads by width, one page on phones).

## Design rules (agreed with the owner)
- Square grid look: thin cobalt lines (`--line`), light blue paper (`--paper`), cream panels (`--panel`), lime (`--lime`) highlights, violet (`--violet`) banner, logo square `#b377ff`.
- Fonts: Germania One for every title and label (the heavy wide italic Archivo look is retired, owner Oct 26 — never use it), Archivo regular for body text, Space Mono for small text.
- Menu text and icons stay blue; the home header fades to `#b377ff` while scrolling down to the purple banner (`#more`).
- Phone (≤760px): header 64px with hamburger; menu drops over the page; castle first and full height with stick / GO / JUMP.
- Keep the castle map, door zones and the drawn art in sync; the frog can jump ~75px (≈4 tiles in the 4× template).

## Before calling a change done
- Run `python3 tools/build.py` if pages changed.
- Check desktop (1440×900) and phone (390×844) in a real browser (Playwright/Chromium), no horizontal scroll, no console errors.
- Keep commits small, with plain-language messages.
