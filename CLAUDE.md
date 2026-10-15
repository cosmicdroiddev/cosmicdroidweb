# cosmicdroid.com — notes for Claude

Portfolio of cosmicdroid (illustrator, animator, muralist from Colombia). Static site, no framework, no build step to deploy: `site/` is published as-is by Netlify (`netlify.toml`).

## Layout
- `site/` — the website. Pages: index (castle game + home), work, murals, about, contact, frog, leapkill (comic + flipbook reader), projects/juno-mural.
- `tools/build.py` — generates every `site/*.html` page (header, footer, nav and all page content live here). **Edit page HTML here, then run `python3 tools/build.py`.** Don't hand-edit the generated HTML; it gets overwritten.
- `tools/webimg.py` — turns big originals into light WebP (`NAME.webp` for zoom + `NAME-sm.webp` for the page). Use it for every new image; never commit print-size files.
- Project pages are built in `tools/build.py` with `gallery()` / `facts()`; images go in `site/assets/img/<slug>/`. Only use files with real names (sketch, process, final…) from the owner's folders, never `Untitled_Artwork`/`IMG_` ones.
- `tools/castle_template.py` — makes the castle drawing templates in `site/assets/castle/`.
- `site/css/style.css` — all styles. Later rules intentionally override earlier ones; append overrides at the end with a comment saying what they do.
- `site/js/castle.js` — the playable castle (map, physics, rooms/doors, mobs, phone stick + buttons, frog position memory). `site/js/game.js` — Frog Jump (opened from the castle TV only; keep it, don't auto-show it).
- `site/js/main.js` — media slots, works deck, loader, footer frog facts, header color on scroll, etc. `site/js/media.js` — paths for every image/GIF slot. `site/js/projects.js` — the project list.
- `site/js/flipbook.js` + `site/css/flipbook.css` — Leap Kill reader (custom; flat pages + one 3D turning sheet; spreads by width, one page on phones).

## Design rules (agreed with the owner)
- Square grid look: thin cobalt lines (`--line`), light blue paper (`--paper`), cream panels (`--panel`), lime (`--lime`) highlights, violet (`--violet`) banner, logo square `#b377ff`.
- Fonts: Archivo (wide italic 900 for headings/labels), Space Mono for small text.
- Menu text and icons stay blue; the home header fades to `#b377ff` while scrolling down to the purple banner (`#more`).
- Phone (≤760px): header 64px with hamburger; menu drops over the page; castle first and full height with stick / GO / JUMP.
- Keep the castle map, door zones and the drawn art in sync; the frog can jump ~75px (≈4 tiles in the 4× template).

## Before calling a change done
- Run `python3 tools/build.py` if pages changed.
- Check desktop (1440×900) and phone (390×844) in a real browser (Playwright/Chromium), no horizontal scroll, no console errors.
- Keep commits small, with plain-language messages.
