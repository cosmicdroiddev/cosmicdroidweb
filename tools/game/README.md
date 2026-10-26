# The Leap Kill videogame on the site

`site/games/leapkill/` is an HTML5 export of the GDevelop project in the owner's
"frog game" folder (`leapkill.json` + `assets/`). `site/js/arcade.js` opens it in a
full-screen window from the castle TV, the home "Arcade" link and the Leap Kill page.

Controls: desktop arrows move, Space jumps, X shoots. Phones play sideways with the
on-screen stick and button (a "turn your phone" card shows when held upright).

## Updating the game after editing it in GDevelop

Easiest: in GDevelop, add an X-key shoot event and the other changes listed in
`patch_game.py`, then Export → Web (HTML5) and replace `site/games/leapkill/` with the export.

Or, from a copy of the project folder, headless:

    ffmpeg -i assets/boss_battle_3_alternate.wav -b:a 128k assets/boss_battle_3_alternate.mp3
    ffmpeg -i assets/8-bit_bossfight.mp3 -b:a 128k assets/8-bit_bossfight-128.mp3
    python3 tools/game/patch_game.py proj/leapkill.json
    npm i gdcore-tools            # bundles GDevelop's exporter
    node tools/game/export.mjs    # reads proj/leapkill.json, writes out/
    rm -rf site/games/leapkill && cp -r out site/games/leapkill
