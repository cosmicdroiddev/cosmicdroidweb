/*
  THE CASTLE: the playable homepage hero
  ---------------------------------------
  A one-screen castle seen from the inside. Walk the Frog around, jump between
  floors, dodge the traps, and use the glowing thing in each room to open that
  part of the site.

  CONTROLS
    computer   ← → or A D walk · space / Z / ↑ / W jump · ↑ / W (standing still) / E / Enter use
               the glowing thing · ↓ / S drop through wooden floors
    phone      the stick under the castle walks (push down to drop through planks),
               jump hops, go opens the glowing thing you're standing at
    anyone     clicking or tapping a glowing thing opens it directly

  CHANGE WHERE THINGS LEAD: edit CASTLE_SPOTS below.
  SWAP IN YOUR ART: set the paths in CASTLE_ART. Draw the castle on top of
  assets/castle/castle-silhouette.png (1440×2400, 4× the 360×600 playfield;
  castle-silhouette-guides.png shows what is solid, the doors, traps and the
  part the page shows). Keep the sky transparent and export at that size.
*/
var CASTLE_ART = {
  castle: "assets/castle/castle.webp", // cosmicdroid's drawing (transparent sky), scaled to the 360-wide world
  castleBox: [0, 0, 360, 473.6],       // where the drawing sits in the world: x, y, width, height
  frog: null,          // 40×40, facing right (a single still picture; the hero below wins when set)
  // the player: one strip of square frames, facing right. Frames: idle, run, attack (stomp).
  hero: { src: "assets/castle/hero-sheet.png", cell: 96, size: 37.5,
          idle: [0, 1], run: [2, 3, 4, 5], attack: [6, 7], fps: { idle: 3.5, run: 9, attack: 8 } },
  slime: null,         // 32×24
  bat: null,           // 32×20
  spider: null,        // 28×24
  drawnDetails: false, // animated extras from the old placeholder castle (off: the drawing has its own)
  title: { show: false, big: "cosmicdroid", small: "portfolio" } // the big name behind the castle (off for now)
};

// Each glowing thing: where it is (in tiles: column, row, width, height) and where it goes.
var CASTLE_SPOTS = [
  { id: "bedroom", room: "My room",  label: "About me",       href: "about.html",   zone: [52.4, 24, 15.2, 7] },   // the bed with the cat
  { id: "playlist", room: "Studio",  label: "My playlist",    href: "https://music.youtube.com/playlist?list=PLMcMfiZgKh7Q1RoNm8sItHevV0RsI1gAZ", external: true, zone: [9, 37, 14, 13] }, // the drum kit
  { id: "library", room: "Studio",   label: "My work",        href: "work.html",    zone: [53.6, 37, 14, 13] },    // the bookshelf
  { id: "arcade",  room: "Arcade",   label: "Play Frog Jump", action: "frogjump",   zone: [19.6, 58, 10.4, 11] },  // the TV
  { id: "post",    room: "Hall",     label: "Contact",        href: "contact.html", zone: [58.4, 80, 9.2, 9] }      // the mailbox
];

(function () {
  var stage = document.querySelector("[data-castle]");
  if (!stage) return;
  var frame = stage.querySelector(".castle-frame");
  var padEl = stage.querySelector(".castle-pad");
  var canvas = frame.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  var base = document.body.getAttribute("data-base") || "";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- palette (from the reference illustration) ----
  var C = {
    paper: "#fcfaea", wash: "#efeefc", lav: "#c7c4f4", lavDark: "#a39ee9", lavLight: "#dedcf9",
    ink: "#2a1c9a", cobalt: "#3d23d6", cyan: "#33c4e6", cyanLight: "#9be6f4",
    lime: "#e4f23f", white: "#ffffff", pink: "#ff8fb8"
  };
  var LW = 1.6;

  // ---- world: 72 × 95 tiles of 5 px, traced from the drawing (assets/castle/castle.webp) ----
  // '#' stone   '=' wooden plank (stand on it, jump up through it, ↓ drops through)   ' ' open
  // Re-trace it after redrawing the castle: tools/castle_trace.py
  var T = 5, COLS = 72, W = 360, H = 475;
  // the part of the world on screen: from just above the battlements down to the bottom of the castle.
  // The tower roof above VY0 sticks out over the menu bar (see SPIRE).
  var VY0 = CASTLE_ART.title.show ? 0 : 38, VY1 = 475, VH = VY1 - VY0;
  var MAP = [
    "                                                                        ",
    "                                                                        ",
    "                                                                        ",
    "                                                                        ",
    "                                                                        ",
    "                                                                        ",
    "                                                                        ",
    "                                                                        ",
    "                              #####  #####  #####   #####  #####   #####",
    "                              ####   #####  #####   #####  #####   #####",
    "                              ####   #####  #####   #####  #####  ######",
    "                              #####  #####  #####   #####  #####  ######",
    "                              ##########################################",
    "                              ######################################### ",
    "                              ######################################### ",
    "                              ####                                 #### ",
    "                              ####                                  ### ",
    "                              ####                                  ####",
    "   ###############            ####                                  ####",
    "   ###############            ####                                  ####",
    "   ###############            ####                                  ####",
    "   ######  #######            ####                                  ####",
    "   #####    #####             ####                                  ####",
    "   ####      ####             ####                                  ####",
    "   ####      ####             ####                                  ####",
    "   ####      ####             ####                                  ### ",
    "   ###        ###             ####                                  ### ",
    "   ###        ###             ####                                  ### ",
    "  ####        ###             ####                                  ### ",
    "  ####        ###             ####                                  ### ",
    "  ####        ########    #############                            #### ",
    "  #######################################===========####################",
    "  #######################################           ####################",
    "  #######################################           ####################",
    "   ####                                                             ####",
    "   ####                                                             ####",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                   ==========                ### ",
    "   ####                                                             ####",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ########===========######################################========### ",
    "   #######            ######################################        ### ",
    "   #######            ######################################        ### ",
    "   ####                              ####                           ### ",
    "   ####                              ####                           ### ",
    "   ####                              ####                           ####",
    "   ####                              ####                           ####",
    "   ####                              ####                           ####",
    "   ####                              ####                           ### ",
    "   ####                              ####                           ### ",
    "   ####                                                             ### ",
    "   ####===========                                                 #### ",
    "   ####                                                            #### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "  #####                                                             ### ",
    "   ####                                                             ### ",
    "  #####                                                            #### ",
    "   ####                                                            #####",
    "   #################################################============########",
    "   #################################################           #########",
    "   #################################################           #########",
    "  ##################################################            ########",
    "  #####                              ####                           ####",
    "  #####                              ####                           ### ",
    "   ####                              ####                           ### ",
    "   ####                              ####                           ### ",
    "   ####                              ####                           ### ",
    "   ####                              ####                           ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                         ==========          ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ### ",
    "   ####                                                             ####",
    "  ######################################################################",
    "   #####################################################################",
    "  ######################################################################",
    "  ######################################################################",
    "  ######################################################################",
    "   ############    #######                     ##############   # ##    "
  ];
  var ROWS = MAP.length;
  // the wooden planks at their exact height in the drawing: [left, right, top] (the '=' in MAP only shows where they are)
  var PLANKS = [[205, 260, 153.5], [210, 260, 199.7], [300, 340, 249.4], [55, 110, 249.8], [35, 90, 303.8], [260, 320, 346.0], [240, 290, 402.9]];
  function tile(c, r) {
    if (c < 0 || c >= COLS) return "#";
    if (r < 0) return " ";
    if (r >= ROWS) return "#";
    return MAP[r][c];
  }

  // rooms: checkpoints and wall colors (tile columns c0..c1, rows r0..r1, floor row, spawn column)
  var ROOMS = [
    { id: "top",    c0: 34, c1: 67, r0: 16, r1: 30, floor: 31, spawn: 38 },
    { id: "studio", c0: 4,  c1: 67, r0: 34, r1: 49, floor: 50, spawn: 30 },
    { id: "arcade", c0: 4,  c1: 67, r0: 53, r1: 68, floor: 69, spawn: 36 },
    { id: "hall",   c0: 4,  c1: 67, r0: 73, r1: 88, floor: 89, spawn: 24 }
  ];
  function roomAt(c, r) {
    for (var i = 0; i < ROOMS.length; i++) {
      var m = ROOMS[i];
      if (c >= m.c0 && c <= m.c1 && r >= m.r0 && r <= m.r1) return m;
    }
    return null;
  }

  // ---- feel ----
  var F = {
    gravity: 1350, jump: 415, // ≈64px high (15% lower than before)
    jumpCut: 0.45, fall: 560,
    run: 118, accel: 1100, airAccel: 800, friction: 1400,
    coyote: 0.09, buffer: 0.12, bed: 500, stomp: 330
  };
  var FW = 15, FH = 20;          // the frog's body (25% bigger than the first version)
  var STEP = 1 / 120;

  // ---- traps and mobs ----
  var BED = { x: 266, y: 136, w: 66, h: 19 };
  var SPIKES = [{ x: 43, y: 332, w: 38, h: 13 }];
  // the pink things in the drawing hurt: spider, snake on the bookshelf, spiky ball
  var HAZARDS = [
    { x: 170, y: 180, w: 24, h: 22 },
    { x: 268, y: 171, w: 66, h: 13 },
    { x: 152, y: 286, w: 20, h: 20 }
  ];
  var MACE = null;
  var MOB_DEFS = []; // no extra monsters: the drawn ones are the traps

  // ---- state ----
  var frog, mobs, parts = [], checkpoint, active = null, t = 0;
  var keys = { left: false, right: false, jumpHeld: false, down: false };
  var pad = { axis: 0 };
  var jumpBuffer = 0, coyote = 0, dropTimer = 0;
  var inView = true, visible = true, engaged = false, hintDone = false, running = false, raf = 0, last = 0, acc = 0;
  var scale = 1, staticLayer = null;
  var IMG = {};

  function spawnPoint(room) {
    return { x: room.spawn * T + (T - FW) / 2, y: room.floor * T - FH, room: room };
  }
  function resetFrog(at) {
    frog = { x: at.x, y: at.y, px: at.x, py: at.y, vx: 0, vy: 0, face: 1, look: 1, squash: 0,
      grounded: false, dead: 0, invuln: 0, blink: 0 };
  }
  function resetMobs() {
    mobs = MOB_DEFS.map(function (d) {
      var m = {}; for (var k in d) m[k] = d[k];
      m.px = m.x; m.py = m.y; m.alive = true; m.respawn = 0; m.t = Math.random() * 6; m.x0 = d.x; m.y0 = d.y;
      return m;
    });
  }
  checkpoint = spawnPoint(ROOMS[3]);
  resetFrog(checkpoint);
  resetMobs();

  // ---- coming back from a page: the frog is where you left him ----
  var SAVE_KEY = "cd-castle-frog-2"; // new castle, new saves
  function saveSpot() {
    if (!frog || frog.dead > 0) return;
    try {
      sessionStorage.setItem(SAVE_KEY, JSON.stringify({
        x: Math.round(frog.x), y: Math.round(frog.y), bottom: Math.round(frog.y + FH), face: frog.face, room: checkpoint.room.id
      }));
    } catch (err) {}
  }
  (function restoreSpot() {
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(SAVE_KEY) || "null"); } catch (err) {}
    if (!saved) return;
    var room = ROOMS.filter(function (r) { return r.id === saved.room; })[0];
    if (!room || !(saved.x >= 0 && saved.x <= W - FW && saved.y >= 0 && saved.y <= H - FH)) return;
    checkpoint = spawnPoint(room);
    var bottom = typeof saved.bottom === "number" ? saved.bottom : saved.y + 16;
    resetFrog({ x: Math.min(saved.x, W - FW), y: bottom - FH });
    frog.face = frog.look = saved.face === -1 ? -1 : 1;
    hintDone = true;
  })();
  window.addEventListener("pagehide", saveSpot);

  Object.keys(CASTLE_ART).forEach(function (k) {
    var src = CASTLE_ART[k];
    if (typeof src !== "string" || !src) return;
    var im = new Image();
    im.onload = function () { IMG[k] = im; staticLayer = null; buildStatic(); if (k === 'castle' && typeof drawSpire === 'function') drawSpire(); };
    im.src = base + src;
  });
  if (CASTLE_ART.hero && CASTLE_ART.hero.src) {
    var heroIm = new Image();
    heroIm.onload = function () { IMG.hero = heroIm; };
    heroIm.src = base + CASTLE_ART.hero.src;
  }

  // ---- helpers ----
  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  function shape(g, fill, stroke, lw) {
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke !== false) { g.strokeStyle = stroke || C.cobalt; g.lineWidth = lw || LW; g.stroke(); }
  }
  function box(g, x, y, w, h, r, fill, stroke, lw) { rr(g, x, y, w, h, r || 0.01); shape(g, fill, stroke, lw); }
  function circ(g, x, y, r, fill, stroke, lw) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); shape(g, fill, stroke, lw); }
  function ell(g, x, y, rx, ry, fill, stroke, lw) { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); shape(g, fill, stroke, lw); }
  function line(g, pts, color, lw) {
    g.beginPath(); g.moveTo(pts[0], pts[1]);
    for (var i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
    g.strokeStyle = color || C.cobalt; g.lineWidth = lw || LW; g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
  }
  function hash(n) {
    n = (n | 0) ^ 0x9e3779b9;
    n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
    n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function archWindow(g, x, y, w, h, glass) {
    g.beginPath();
    g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath();
    shape(g, glass || C.lime, C.cobalt, LW);
    line(g, [x + w / 2, y + 2, x + w / 2, y + h], C.cobalt, 1.3);
    line(g, [x, y + h * 0.58, x + w, y + h * 0.58], C.cobalt, 1.3);
  }
  function sign(g, room) {
    var cx = (room.c0 + room.c1 + 1) * T / 2, y = room.r0 * T + 4;
    g.font = '13px "VT323", monospace';
    var w = g.measureText(room.sign).width + 12;
    box(g, cx - w / 2, y, w, 13, 3, C.lime, C.cobalt, 1.2);
    g.fillStyle = C.ink; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(room.sign, cx, y + 7.5);
    g.textAlign = "left"; g.textBaseline = "alphabetic";
  }

  // ---- the static picture (rebuilt only on resize) ----
  function buildStatic() {
    staticLayer = document.createElement("canvas");
    staticLayer.width = canvas.width; staticLayer.height = canvas.height;
    var g = staticLayer.getContext("2d");
    g.setTransform(canvas.width / W, 0, 0, canvas.height / VH, 0, -VY0 * canvas.height / VH);
    if (CASTLE_ART.title.show) drawTitle(g);
    if (IMG.castle) { var cb = CASTLE_ART.castleBox || [0, 0, W, H]; g.drawImage(IMG.castle, cb[0], cb[1], cb[2], cb[3]); return; }

    var c, r, ch;
    // room walls
    for (r = 8; r < 26; r++) for (c = 1; c < 17; c++) {
      if (tile(c, r) === "#") continue;
      var room = roomAt(c, r) || roomAt(c - 1, r) || roomAt(c, r + 1) || ROOMS[1];
      g.fillStyle = room.color || C.wash;
      g.fillRect(c * T, r * T, T, T);
    }
    ROOMS.forEach(function (room, i) {
      if (!room.color) return;
      for (var k = 0; k < 4; k++) {
        var bx = (room.c0 * T) + 8 + hash(i * 31 + k) * ((room.c1 - room.c0 + 1) * T - 40);
        var by = room.r0 * T + 26 + hash(i * 17 + k * 5) * 50;
        box(g, bx, by, 20, 9, 3, C.lavLight, C.lavDark, 1);
      }
    });
    drawFurniture(g);

    // stone: lavender bricks, cobalt outline
    g.save();
    g.beginPath();
    for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) if (tile(c, r) === "#") g.rect(c * T, r * T, T, T);
    g.clip();
    g.fillStyle = C.lav; g.fillRect(0, 0, W, H);
    g.strokeStyle = C.lavDark; g.lineWidth = 1;
    for (var y = 0; y < H; y += 10) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
      var off = (y / 10) % 2 ? 10 : 0;
      for (var x = off; x < W; x += 20) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 10); g.stroke(); }
    }
    g.restore();
    g.strokeStyle = C.cobalt; g.lineWidth = 2; g.lineCap = "square";
    for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
      if (tile(c, r) !== "#") continue;
      var x0 = c * T, y0 = r * T;
      g.beginPath();
      if (tile(c, r - 1) !== "#" && r > 0) { g.moveTo(x0, y0); g.lineTo(x0 + T, y0); }
      if (tile(c, r + 1) !== "#" && r < ROWS - 1) { g.moveTo(x0, y0 + T); g.lineTo(x0 + T, y0 + T); }
      if (c > 0 && tile(c - 1, r) !== "#") { g.moveTo(x0, y0); g.lineTo(x0, y0 + T); }
      if (c < COLS - 1 && tile(c + 1, r) !== "#") { g.moveTo(x0 + T, y0); g.lineTo(x0 + T, y0 + T); }
      g.stroke();
    }
    // outer edge of the castle body
    g.beginPath(); g.moveTo(1, 80); g.lineTo(1, 560); g.moveTo(W - 1, 120); g.lineTo(W - 1, 560); g.stroke();

    // wooden planks and shelves
    for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
      if (tile(c, r) !== "=") continue;
      box(g, c * T, r * T, T, 7, 1.5, C.cyan, C.cobalt, 1.4);
      line(g, [c * T + 4, r * T + 3.5, c * T + 12, r * T + 3.5], C.cyanLight, 1);
      var slab = r === 8 || r === 14 || r === 20;
      if (!slab && (tile(c - 1, r) !== "=" || tile(c + 1, r) !== "=")) {
        var bx2 = tile(c - 1, r) !== "=" ? c * T + 3 : c * T + T - 9;
        g.beginPath(); g.moveTo(bx2, r * T + 7); g.lineTo(bx2 + 6, r * T + 7); g.lineTo(bx2 + (tile(c - 1, r) !== "=" ? 0 : 6), r * T + 14); g.closePath();
        shape(g, C.cobalt, false);
      }
    }

    // tower roof, tower window, turret battlements
    drawTowerRoof(g);
    archWindow(g, 16, 96, 26, 34, "#241783");
    [300, 324, 348].forEach(function (mx) { box(g, mx, 111, 12, 9, 1, C.lav, C.cobalt, 2); });
    box(g, -2, 72, 64, 9, 1, C.lav, C.cobalt, 2);

    // ground under the castle (the phone buttons sit here)
    g.clearRect(0, 561, W, 40);
    line(g, [0, 560, W, 560], C.cobalt, 2);
    for (var tf = 0; tf < 9; tf++) {
      var gx = 10 + tf * 42 + hash(tf) * 12;
      line(g, [gx, 568, gx + 3, 562, gx + 6, 568, gx + 9, 563, gx + 12, 568], C.cobalt, 1.3);
    }

    ROOMS.forEach(function (room) { if (room.sign) sign(g, room); });
  }

  function drawTowerRoof(g) {
    g.beginPath(); g.moveTo(-6, 81); g.lineTo(30, 14); g.lineTo(66, 81); g.closePath();
    shape(g, C.cobalt, C.cobalt, 2);
    for (var s = 0; s < 3; s++) {
      var sy = 46 + s * 11, half = 8 + s * 6;
      line(g, [30 - half, sy, 30 - half + 4, sy + 7, 30 - half + 8, sy, 30 - half + 12, sy + 7, 30 - half + 16, sy], C.lavLight, 1.4);
    }
  }

  // ---- the tip of the tower roof sticks out above the castle (and over the menu bar) ----
  // The castle picture is cropped at VY0, so the part of the roof above that is drawn
  // on its own little canvas sitting on top of the castle frame.
  var SPIRE = { x0: 0, x1: 66, y0: 0 };
  var spire = document.createElement("canvas");
  spire.className = "castle-spire";
  spire.setAttribute("aria-hidden", "true");
  frame.appendChild(spire);
  function drawSpire() {
    if (VY0 <= SPIRE.y0) { spire.style.display = "none"; return; }
    spire.style.display = "";
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = (SPIRE.x1 - SPIRE.x0) * scale, h = (VY0 - SPIRE.y0) * scale;
    spire.style.width = w + "px"; spire.style.height = h + "px";
    // the frame's top-left corner is the canvas's top-left corner (plus its 1px border)
    var bl = parseFloat(getComputedStyle(canvas).borderLeftWidth) || 0;
    var bt = parseFloat(getComputedStyle(canvas).borderTopWidth) || 0;
    spire.style.left = (bl + SPIRE.x0 * scale) + "px";
    spire.style.top = (bt - h + 0.5) + "px";
    spire.width = Math.round(w * dpr); spire.height = Math.round(h * dpr);
    var g = spire.getContext("2d");
    g.setTransform(dpr * scale, 0, 0, dpr * scale, -SPIRE.x0 * scale * dpr, -SPIRE.y0 * scale * dpr);
    g.clearRect(SPIRE.x0, SPIRE.y0, SPIRE.x1 - SPIRE.x0, VY0 - SPIRE.y0);
    if (IMG.castle) {
      // the top of the drawn tower roof, cut from the drawing
      var cb = CASTLE_ART.castleBox || [0, 0, W, H], k = IMG.castle.width / cb[2];
      g.drawImage(IMG.castle, (SPIRE.x0 - cb[0]) * k, (SPIRE.y0 - cb[1]) * k, (SPIRE.x1 - SPIRE.x0) * k, (VY0 - SPIRE.y0) * k,
        SPIRE.x0, SPIRE.y0, SPIRE.x1 - SPIRE.x0, VY0 - SPIRE.y0);
    } else drawTowerRoof(g);
  }
  // As the page scrolls, the tip slides in behind the menu bar: the part of it allowed
  // above the bar's bottom edge shrinks by however far you've scrolled, so at rest it
  // overlaps the bar and a moment later it is simply tucked underneath, like the castle.
  var headerEl = document.querySelector(".site-header");
  var spireOverlap0 = 0, spireTick = false;
  function measureSpire() {
    if (!headerEl) return;
    var fr = headerEl.parentElement;                                  // the bar sits at the top of the frame
    var hb0 = fr.getBoundingClientRect().top + window.scrollY + fr.clientTop + headerEl.offsetHeight;
    var st0 = spire.getBoundingClientRect().top + window.scrollY;     // tip's top edge on the page
    spireOverlap0 = Math.max(0, hb0 - st0);
  }
  function spireScroll() {
    if (!headerEl) return;
    var allowed = Math.max(0, spireOverlap0 - window.scrollY);
    var line = headerEl.getBoundingClientRect().bottom - allowed;
    var cut = Math.max(0, line - spire.getBoundingClientRect().top);
    spire.style.clipPath = cut > 0 ? "inset(" + cut.toFixed(1) + "px 0 0 0)" : "";
  }
  window.addEventListener("scroll", function () {
    if (spireTick) return;
    spireTick = true;
    requestAnimationFrame(function () { spireTick = false; spireScroll(); });
  }, { passive: true });

  function drawTitle(g) {
    var tt = CASTLE_ART.title;
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    var size = 66;
    g.font = size + 'px "Pirata One", Georgia, serif';
    var w = g.measureText(tt.big).width;
    if (w > 292) { size = Math.floor(size * 292 / w); g.font = size + 'px "Pirata One", Georgia, serif'; w = g.measureText(tt.big).width; }
    var cx = 196, by = 134;
    g.fillStyle = C.lime; g.fillText(tt.big, cx + 3, by + 3);
    g.lineWidth = 3; g.strokeStyle = C.lime; g.strokeText(tt.big, cx + 3, by + 3);
    g.fillStyle = C.cobalt; g.fillText(tt.big, cx, by);
    g.font = '20px "VT323", monospace';
    var sw = g.measureText(tt.small).width;
    box(g, cx - sw / 2 - 8, 48, sw + 16, 18, 4, C.cobalt, false);
    g.fillStyle = C.paper; g.fillText(tt.small, cx, 62);
    g.textAlign = "left";
  }

  function drawFurniture(g) {
    // my room: posters, window, drum kit, bed
    box(g, 28, 204, 24, 30, 2, C.cyan, C.cobalt);
    circ(g, 40, 215, 6, C.white, C.cobalt, 1.2); circ(g, 37.6, 214, 1.4, C.cobalt, false); circ(g, 42.4, 214, 1.4, C.cobalt, false);
    line(g, [36, 226, 44, 226], C.cobalt, 1.2);
    box(g, 58, 208, 20, 24, 2, C.lime, C.cobalt);
    g.beginPath(); g.moveTo(70, 211); g.lineTo(63, 221); g.lineTo(68, 221); g.lineTo(65, 229); g.lineTo(73, 218); g.lineTo(68, 218); g.closePath(); shape(g, C.cobalt, false);
    archWindow(g, 150, 202, 20, 30);
    line(g, [24, 280, 24, 252], C.cobalt, 1.4);
    ell(g, 24, 252, 9, 2.4, C.lime, C.cobalt, 1.2); ell(g, 24, 255, 9, 2.4, C.lime, C.cobalt, 1.2);
    line(g, [78, 280, 78, 246], C.cobalt, 1.4);
    ell(g, 78, 246, 11, 2.6, C.lime, C.cobalt, 1.2);
    box(g, 33, 244, 14, 9, 2, C.cyan, C.cobalt, 1.3);
    circ(g, 50, 267, 12.5, C.cyan, C.cobalt, 1.6);
    circ(g, 50, 267, 8, C.white, C.cobalt, 1.2);
    box(g, 62, 258, 13, 8, 2, C.cyan, C.cobalt, 1.3);
    line(g, [64, 256, 72, 248], C.cobalt, 1.3);
    box(g, 98, 244, 6, 36, 2, C.cobalt, C.cobalt);
    box(g, 100, 268, 60, 12, 2, C.cobalt, C.cobalt);
    box(g, 103, 261, 56, 8, 3, C.white, C.cobalt, 1.3);
    box(g, 117, 260, 42, 9, 3, C.lime, C.cobalt, 1.3);
    box(g, 106, 256, 13, 7, 3, C.white, C.cobalt, 1.3);

    // library: bookcase, lectern
    box(g, 296, 198, 40, 40, 2, C.cobalt, C.cobalt);
    var bookColors = [C.cyan, C.lime, C.lavLight, C.white, C.pink];
    for (var sh = 0; sh < 3; sh++) {
      var bx = 299, by = 201 + sh * 12;
      for (var b = 0; bx < 332; b++) {
        var bw = 3 + Math.floor(hash(sh * 9 + b) * 3);
        g.fillStyle = bookColors[Math.floor(hash(sh * 7 + b * 3) * 5)];
        g.fillRect(bx, by + (hash(b + sh) < 0.3 ? 2 : 0), Math.min(bw, 332 - bx), 9 - (hash(b + sh) < 0.3 ? 2 : 0));
        bx += bw + 1;
      }
    }
    archWindow(g, 204, 198, 16, 26);
    for (var bk = 0; bk < 3; bk++) box(g, 246 + bk * 4, 208 + bk, 4, 12 - bk, 0.5, bookColors[bk], C.cobalt, 1);
    line(g, [222, 280, 222, 258], C.cobalt, 3);
    line(g, [212, 280, 232, 280], C.cobalt, 3);
    g.save(); g.translate(222, 254); g.rotate(-0.18);
    box(g, -16, -4, 32, 8, 2, C.cobalt, C.cobalt);
    g.restore();

    // arcade: TV, console, poster, beanbag
    box(g, 22, 384, 38, 16, 2, C.lav, C.cobalt);
    line(g, [36, 350, 29, 337], C.cobalt, 1.4); line(g, [46, 350, 53, 337], C.cobalt, 1.4);
    box(g, 24, 349, 34, 35, 5, C.cobalt, C.cobalt);
    box(g, 41, 378, 15, 6, 1.5, C.lime, C.cobalt, 1.2);
    box(g, 106, 310, 50, 24, 2, C.lime, C.cobalt);
    g.fillStyle = C.ink; g.font = '11px "VT323", monospace'; g.textAlign = "center";
    g.fillText("FROG", 125, 320); g.fillText("JUMP", 125, 330);
    g.textAlign = "left";
    circ(g, 145, 322, 5, C.cyan, C.cobalt, 1.1);
    for (var cg = 0; cg < 3; cg++) box(g, 64 + cg * 5, 330, 4, 10, 0.5, [C.lime, C.white, C.pink][cg], C.cobalt, 1);
    ell(g, 122, 392, 15, 8, C.lavLight, C.cobalt);

    // mural studio: the mural, ladder, paint
    box(g, 256, 316, 78, 52, 2, C.white, C.cobalt, 2);
    circ(g, 274, 333, 8, C.lime, C.cobalt, 1.3);
    g.beginPath(); g.moveTo(258, 366); g.lineTo(282, 342); g.lineTo(298, 356); g.lineTo(312, 340); g.lineTo(332, 366); g.closePath(); shape(g, C.lav, C.cobalt, 1.3);
    ell(g, 314, 354, 11, 9, C.cyan, C.cobalt, 1.3);
    circ(g, 310, 352, 2.4, C.white, false); circ(g, 318, 352, 2.4, C.white, false);
    circ(g, 310.6, 352.4, 1, C.cobalt, false); circ(g, 318.6, 352.4, 1, C.cobalt, false);
    line(g, [244, 400, 248, 322], C.cyan, 2.2); line(g, [256, 400, 258, 322], C.cyan, 2.2);
    for (var rung = 0; rung < 6; rung++) line(g, [245 + rung * 0.5, 392 - rung * 13, 256 + rung * 0.3, 392 - rung * 13], C.cobalt, 1.3);
    box(g, 300, 388, 12, 12, 1.5, C.lime, C.cobalt, 1.3);
    box(g, 315, 390, 10, 10, 1.5, C.cyan, C.cobalt, 1.3);
    line(g, [303, 388, 303, 393], C.cobalt, 1.2); line(g, [318, 390, 318, 396], C.cobalt, 1.2);
    box(g, 206, 300, 12, 4, 1, C.cobalt, C.cobalt);

    // great hall: gate, banner, bounty board
    g.beginPath(); g.moveTo(22, 520); g.lineTo(22, 482); g.arc(38, 482, 16, Math.PI, 0); g.lineTo(54, 520); g.closePath();
    shape(g, C.cobalt, C.cobalt, 2);
    for (var st = 0; st < 3; st++) { circ(g, 28, 484 + st * 12, 1.6, C.lime, false); circ(g, 48, 484 + st * 12, 1.6, C.lime, false); }
    line(g, [38, 470, 38, 520], C.lavDark, 1.2);
    circ(g, 44, 500, 3, null, C.lime, 1.4);
    box(g, 66, 428, 20, 44, 1, C.cobalt, C.cobalt);
    g.beginPath(); g.moveTo(66, 472); g.lineTo(76, 464); g.lineTo(86, 472); g.closePath(); g.fillStyle = "#efedfc"; g.fill();
    circ(g, 76, 446, 6, C.lime, false);
    circ(g, 73, 441, 2.4, C.white, false); circ(g, 79, 441, 2.4, C.white, false);
    line(g, [104, 488, 104, 520], C.cobalt, 2); line(g, [136, 488, 136, 520], C.cobalt, 2);
    box(g, 96, 450, 48, 38, 2, C.lav, C.cobalt, 2);
    [[100, 455], [121, 453], [109, 470]].forEach(function (p, i) {
      box(g, p[0], p[1], 17, 15, 1, C.white, C.cobalt, 1.1);
      circ(g, p[0] + 8.5, p[1] + 8, 3.6, [C.cyan, C.lime, C.pink][i], C.cobalt, 1);
    });

    // post room: letters on the shelf, spikes, mailbox
    for (var lt = 0; lt < 3; lt++) {
      var lx = 264 + lt * 11, ly = 452 - (lt === 1 ? 2 : 0);
      box(g, lx, ly, 10, 8, 1, C.white, C.cobalt, 1);
      line(g, [lx, ly, lx + 5, ly + 4, lx + 10, ly], C.cobalt, 1);
    }
    SPIKES.forEach(function (sp) {
      for (var k = 0; k < 4; k++) {
        var x0 = sp.x - 2 + k * 10;
        g.beginPath(); g.moveTo(x0, 520); g.lineTo(x0 + 5, 507); g.lineTo(x0 + 10, 520); g.closePath();
        shape(g, C.white, C.cobalt, 1.4);
      }
    });
    line(g, [319, 520, 319, 498], C.cobalt, 3.5);
    g.beginPath(); g.moveTo(302, 498); g.lineTo(302, 486); g.arc(319, 486, 17, Math.PI, 0); g.lineTo(336, 498); g.closePath();
    shape(g, C.cobalt, C.cobalt, 2);
    line(g, [309, 489, 323, 489], C.lime, 1.6);
    line(g, [337, 496, 337, 478], C.cobalt, 1.6);
    box(g, 337, 478, 8, 6, 1, C.lime, C.cobalt, 1.2);
    box(g, 282, 513, 11, 7, 1, C.white, C.cobalt, 1); box(g, 288, 511, 11, 7, 1, C.white, C.cobalt, 1);
  }

  // ---- animated details ----
  function drawDetails(g, time) {
    var s = time / 1000;
    // TV screen: a tiny Frog Jump
    box(g, 28, 353, 26, 24, 3, C.cyan, false);
    var hop = Math.abs(Math.sin(s * 3)) * 9;
    line(g, [32, 372, 40, 372], C.white, 1.6); line(g, [44, 364, 51, 364], C.white, 1.6);
    circ(g, 37 + Math.sin(s * 1.5) * 4, 368 - hop, 2.6, C.lime, false);
    g.fillStyle = "rgba(255,255,255,0.18)";
    for (var sl = 0; sl < 6; sl++) g.fillRect(28, 354 + sl * 4 + (time / 80 % 4), 26, 1);

    // lectern book glowing
    var gl = 0.35 + 0.15 * Math.sin(s * 2.5);
    glow(g, 222, 246, 26, "rgba(228,242,63," + gl.toFixed(2) + ")");
    g.save(); g.translate(222, 248); g.rotate(-0.18);
    box(g, -13, -5, 13, 6, 1, C.white, C.cobalt, 1.2); box(g, 0, -5, 13, 6, 1, C.white, C.cobalt, 1.2);
    g.restore();

    // Ciruela asleep on the bed
    var br = 1 + Math.sin(s * 1.6) * 0.04;
    g.save(); g.translate(142, 260); g.scale(1, br);
    ell(g, 0, -6, 15, 8, C.cyan, C.cobalt, 1.4);
    for (var stp = -8; stp <= 8; stp += 6) line(g, [stp, -13, stp + 2, -7], C.cobalt, 1.3);
    circ(g, 11, -9, 6.5, C.cyan, C.cobalt, 1.4);
    g.beginPath(); g.moveTo(7, -13); g.lineTo(8, -19); g.lineTo(12, -15); g.closePath(); shape(g, C.cyan, C.cobalt, 1.2);
    g.beginPath(); g.moveTo(13, -15); g.lineTo(17, -19); g.lineTo(17, -12); g.closePath(); shape(g, C.cyan, C.cobalt, 1.2);
    line(g, [8, -9, 11, -9], C.cobalt, 1.1); line(g, [13, -9, 16, -9], C.cobalt, 1.1);
    g.restore();
    g.fillStyle = C.cobalt; g.font = '12px "VT323", monospace';
    for (var z = 0; z < 3; z++) {
      var zp = ((s * 0.5 + z / 3) % 1);
      g.globalAlpha = 1 - zp;
      g.fillText("z", 156 + zp * 10 + z * 2, 246 - zp * 22);
    }
    g.globalAlpha = 1;

    // floating candle in the library
    var cy = 206 + Math.sin(s * 1.4) * 4;
    box(g, 230, cy, 6, 12, 1, C.white, C.cobalt, 1.2);
    flame(g, 233, cy, s);
    // torch in the hall
    line(g, [160, 468, 160, 452], C.cobalt, 3);
    box(g, 155, 450, 10, 4, 1, C.cobalt, C.cobalt);
    flame(g, 160, 450, s + 1);
    glow(g, 160, 444, 30, "rgba(228,242,63,0.25)");

    // the crow on the mailbox
    var blink = (s % 3.4) < 0.12;
    g.save(); g.translate(318, 469);
    ell(g, 0, 0, 8, 6, C.cobalt, C.cobalt);
    circ(g, 6, -6, 5, C.cobalt, C.cobalt);
    g.beginPath(); g.moveTo(10, -6); g.lineTo(16, -4.5); g.lineTo(10, -3.5); g.closePath(); shape(g, C.lime, C.cobalt, 1);
    g.beginPath(); g.moveTo(-7, -1); g.lineTo(-13, -4); g.lineTo(-8, 3); g.closePath(); shape(g, C.cobalt, false);
    if (blink) line(g, [5, -7, 9, -7], C.lime, 1.3); else circ(g, 7, -7, 1.6, C.lime, false);
    g.restore();

    // the resident in the tower window, watching the Frog
    var eyeOpen = (s % 4.2) > 0.15;
    var dx = Math.max(-1.5, Math.min(1.5, (frog.x - 30) / 80));
    if (eyeOpen) {
      circ(g, 24 + dx, 114, 3.6, C.lime, false); circ(g, 34 + dx, 114, 3.6, C.lime, false);
      circ(g, 24 + dx * 1.6, 114, 1.5, "#241783", false); circ(g, 34 + dx * 1.6, 114, 1.5, "#241783", false);
    } else {
      line(g, [21, 114, 27, 114], C.lime, 1.4); line(g, [31, 114, 37, 114], C.lime, 1.4);
    }
    // flag on the turret
    line(g, [354, 111, 354, 82], C.cobalt, 2);
    var wv = Math.sin(s * 4) * 2;
    g.beginPath(); g.moveTo(354, 83); g.quadraticCurveTo(343, 86 + wv, 334, 84); g.lineTo(337, 91); g.quadraticCurveTo(345, 93 - wv, 354, 95); g.closePath();
    shape(g, C.lime, C.cobalt, 1.3);
  }

  function glow(g, x, y, r, color) {
    var gr = g.createRadialGradient(x, y, 1, x, y, r);
    gr.addColorStop(0, color); gr.addColorStop(1, "rgba(228,242,63,0)");
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function flame(g, x, y, s) {
    var f = 1 + Math.sin(s * 11) * 0.12 + Math.sin(s * 23) * 0.08;
    ell(g, x, y - 5 * f, 3.4, 6 * f, C.lime, C.cobalt, 1.1);
    ell(g, x, y - 3.5 * f, 1.4, 2.6 * f, C.white, false);
  }

  // ---- traps and mobs drawing ----
  function maceAngle() { return MACE.amp * Math.sin(t * MACE.speed); }
  function macePos(a) { return { x: MACE.px + Math.sin(a) * MACE.len, y: MACE.py + 4 + Math.cos(a) * MACE.len }; }
  function drawMace(g) {
    if (!MACE) return;
    var p = macePos(maceAngle());
    line(g, [MACE.px, MACE.py + 4, p.x, p.y], C.cobalt, 1.6);
    for (var k = 1; k < 6; k++) {
      var lx = MACE.px + (p.x - MACE.px) * k / 6, ly = MACE.py + 4 + (p.y - MACE.py - 4) * k / 6;
      circ(g, lx, ly, 1.8, null, C.cobalt, 1.2);
    }
    for (var sp = 0; sp < 8; sp++) {
      var a = sp / 8 * Math.PI * 2 + t;
      g.beginPath();
      g.moveTo(p.x + Math.cos(a - 0.3) * MACE.r * 0.8, p.y + Math.sin(a - 0.3) * MACE.r * 0.8);
      g.lineTo(p.x + Math.cos(a) * (MACE.r + 5), p.y + Math.sin(a) * (MACE.r + 5));
      g.lineTo(p.x + Math.cos(a + 0.3) * MACE.r * 0.8, p.y + Math.sin(a + 0.3) * MACE.r * 0.8);
      g.closePath(); shape(g, C.white, C.cobalt, 1.1);
    }
    circ(g, p.x, p.y, MACE.r, C.lime, C.cobalt, 1.6);
  }

  var MOB_SCALE = 1.25;
  function drawMob(g, m, x, y) {
    var S = MOB_SCALE, dw = m.w / S, dh = m.h / S, ax = x + m.w / 2, ay, lx = -dw / 2, ly;
    if (m.kind === "slime") { ay = y + m.h; ly = -dh; }
    else if (m.kind === "spider") { ay = y; ly = 0; }
    else { ay = y + m.h / 2; ly = -dh / 2; }
    var mm = Object.create(m);
    mm.w = dw; mm.h = dh;
    if (m.kind === "spider") mm.top = (m.top - ay) / S;
    g.save();
    g.translate(ax, ay); g.scale(S, S);
    drawMobArt(g, mm, lx, ly);
    g.restore();
  }
  function drawMobArt(g, m, x, y) {
    var img = IMG[m.kind];
    if (img) {
      g.save();
      if (m.vx < 0) { g.translate(x + m.w, y); g.scale(-1, 1); g.drawImage(img, 0, 0, m.w, m.h); }
      else g.drawImage(img, x, y, m.w, m.h);
      g.restore();
      return;
    }
    var cx = x + m.w / 2, s = m.t;
    if (m.kind === "slime") {
      var wob = Math.sin(s * 6) * 1.2;
      g.beginPath();
      g.moveTo(x - 1, y + m.h);
      g.quadraticCurveTo(x - 1, y - 2 - wob, cx, y - 2 - wob);
      g.quadraticCurveTo(x + m.w + 1, y - 2 - wob, x + m.w + 1, y + m.h);
      g.closePath(); shape(g, C.lime, C.cobalt, 1.5);
      var dir = m.vx > 0 ? 1.5 : -1.5;
      circ(g, cx - 3 + dir, y + 4, 2.2, C.white, C.cobalt, 1); circ(g, cx + 3 + dir, y + 4, 2.2, C.white, C.cobalt, 1);
      circ(g, cx - 3 + dir * 1.4, y + 4, 0.9, C.cobalt, false); circ(g, cx + 3 + dir * 1.4, y + 4, 0.9, C.cobalt, false);
    } else if (m.kind === "bat") {
      var flap = Math.sin(s * 14);
      var cy = y + m.h / 2;
      for (var side = -1; side <= 1; side += 2) {
        g.beginPath();
        g.moveTo(cx + side * 3, cy);
        g.quadraticCurveTo(cx + side * 9, cy - 9 * flap, cx + side * 14, cy - 3 * flap);
        g.lineTo(cx + side * 10, cy + 3); g.lineTo(cx + side * 6, cy + 4);
        g.closePath(); shape(g, C.lav, C.cobalt, 1.2);
      }
      circ(g, cx, cy, 5.5, C.cobalt, C.cobalt, 1);
      g.beginPath(); g.moveTo(cx - 4, cy - 3); g.lineTo(cx - 3, cy - 9); g.lineTo(cx - 1, cy - 4); g.fill();
      g.beginPath(); g.moveTo(cx + 4, cy - 3); g.lineTo(cx + 3, cy - 9); g.lineTo(cx + 1, cy - 4); g.fill();
      circ(g, cx - 2, cy - 0.5, 1.4, C.lime, false); circ(g, cx + 2, cy - 0.5, 1.4, C.lime, false);
    } else if (m.kind === "spider") {
      line(g, [cx, m.top, cx, y + 2], C.lavDark, 1);
      for (var l = 0; l < 3; l++) {
        var w2 = Math.sin(s * 8 + l) * 1.5;
        line(g, [cx - 4, y + 4 + l * 2, cx - 10, y + 1 + l * 4 + w2, cx - 11, y + 8 + l * 3], C.cobalt, 1.2);
        line(g, [cx + 4, y + 4 + l * 2, cx + 10, y + 1 + l * 4 - w2, cx + 11, y + 8 + l * 3], C.cobalt, 1.2);
      }
      circ(g, cx, y + 6, 6.5, C.cobalt, C.cobalt, 1);
      circ(g, cx - 2.4, y + 5, 2.2, C.white, false); circ(g, cx + 2.4, y + 5, 2.2, C.white, false);
      circ(g, cx - 2.4, y + 5.6, 1, C.cobalt, false); circ(g, cx + 2.4, y + 5.6, 1, C.cobalt, false);
      circ(g, cx - 3, y + 9.5, 0.9, C.pink, false); circ(g, cx + 3, y + 9.5, 0.9, C.pink, false);
    }
  }

  function drawFrog(g, x, y) {
    if (frog.dead > 0) return;
    if (frog.invuln > 0 && Math.floor(frog.invuln * 12) % 2) return;
    var cx = x + FW / 2, fy = y + FH;
    var air = !frog.grounded;
    var stretch = air ? Math.min(Math.abs(frog.vy) / F.jump, 1) * 0.12 : 0;
    var sq = frog.squash * 0.22;
    if (IMG.hero) {
      var hc = CASTLE_ART.hero, set, fps;
      if (frog.attack > 0) { set = hc.attack; fps = hc.fps.attack; }
      else if (air) { set = [hc.run[frog.vy < 0 ? 0 : 2]]; fps = 1; }
      else if (Math.abs(frog.vx) > 12) { set = hc.run; fps = hc.fps.run * Math.min(1.2, 0.6 + Math.abs(frog.vx) / F.run * 0.6); }
      else { set = hc.idle; fps = hc.fps.idle; }
      var fi = set[Math.floor(t * fps) % set.length];
      var S = hc.size;
      g.save(); g.translate(cx, fy + 0.5);
      g.scale(frog.look * (1 + sq - stretch), 1 - sq + stretch);
      g.drawImage(IMG.hero, fi * hc.cell, 0, hc.cell, hc.cell, -S / 2, -S, S, S);
      g.restore(); return;
    }
    if (IMG.frog) {
      g.save(); g.translate(cx, fy); g.scale(frog.look * (1 + sq - stretch), 1 - sq + stretch);
      g.drawImage(IMG.frog, -10, -20, 20, 20); g.restore(); return;
    }
    g.save();
    g.translate(cx, fy);
    g.scale(frog.look * (1 + sq - stretch), 1 - sq + stretch);
    // legs
    if (air) {
      ell(g, -5, -1, 3, 2.6, C.cobalt, false); ell(g, 5, -1, 3, 2.6, C.cobalt, false);
    } else {
      var step = Math.abs(frog.vx) > 10 ? Math.sin(t * 22) * 1.2 : 0;
      ell(g, -5, -1 - Math.max(0, step), 3.6, 1.8, C.cobalt, false); ell(g, 5, -1 - Math.max(0, -step), 3.6, 1.8, C.cobalt, false);
    }
    // body
    g.beginPath(); g.ellipse(0, -7, 9, 6.6, 0, 0, Math.PI * 2); shape(g, C.cyan, C.cobalt, 1.5);
    ell(g, 1, -5, 4.5, 2.8, C.cyanLight, false);
    // bandana with a tail that trails behind
    box(g, -9, -10.5, 18, 3, 1, C.lime, C.cobalt, 1);
    var tail = Math.sin(t * 12) * 1.5 + (air ? 2 : 0);
    g.beginPath(); g.moveTo(-8, -9.5); g.lineTo(-14, -11 + tail); g.lineTo(-13, -7.5 + tail); g.closePath(); shape(g, C.lime, C.cobalt, 1);
    // eyes
    circ(g, -4, -13.5, 4, C.white, C.cobalt, 1.3); circ(g, 4.5, -13.5, 4, C.white, C.cobalt, 1.3);
    var look = frog.vy > 220 ? 1.5 : 0;
    circ(g, -3, -13.3 + look, 1.7, C.cobalt, false); circ(g, 5.5, -13.3 + look, 1.7, C.cobalt, false);
    line(g, [2, -4.8, 6, -5.2], C.cobalt, 1.1);
    g.restore();
  }

  function drawBubble(g, spot, time) {
    var z = spot.zone;
    var x = z[0] * T, y = z[1] * T, w = z[2] * T, h = z[3] * T;
    var pulse = 0.5 + 0.5 * Math.sin(time / 180);
    g.setLineDash([4, 3]);
    box(g, x - 1, y - 1, w + 2, h + 2, 4, null, "rgba(61,35,214," + (0.45 + pulse * 0.4).toFixed(2) + ")", 1.5);
    g.setLineDash([]);
    var label = (coarse ? "" : "↑ ") + spot.label;
    g.font = '15px "VT323", monospace';
    var tw = g.measureText(label).width + 14;
    var bx = Math.max(4, Math.min(W - tw - 4, x + w / 2 - tw / 2));
    var by = y - 24 - pulse * 2;
    if (by < VY0 + 4) by = y + h + 6;
    box(g, bx, by, tw, 18, 5, C.cobalt, C.cobalt);
    g.beginPath(); g.moveTo(x + w / 2 - 4, by + 18); g.lineTo(x + w / 2, by + 23); g.lineTo(x + w / 2 + 4, by + 18); g.closePath(); g.fillStyle = C.cobalt; g.fill();
    g.fillStyle = C.paper; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(label, bx + tw / 2, by + 9.5);
    g.textAlign = "left"; g.textBaseline = "alphabetic";
  }

  function drawHint(g, time) {
    var focused = document.hasFocus();
    var text = coarse || padShown() ? "drag the stick to walk" : focused ? "← → walk · space jump" : "click the castle to play";
    g.font = '15px "VT323", monospace';
    var tw = g.measureText(text).width + 16;
    var fx = frog.x + FW / 2;
    var bx = Math.max(4, Math.min(W - tw - 4, fx - tw / 2));
    var by = frog.y - 34 - (0.5 + 0.5 * Math.sin(time / 260)) * 3;
    box(g, bx, by, tw, 19, 6, C.lime, C.cobalt, 1.4);
    g.beginPath(); g.moveTo(fx - 4, by + 19); g.lineTo(fx, by + 25); g.lineTo(fx + 4, by + 19); g.closePath(); shape(g, C.lime, C.cobalt, 1.4);
    g.fillStyle = C.lime; g.fillRect(fx - 3, by + 17.5, 6, 2.5);
    g.fillStyle = C.ink; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(text, bx + tw / 2, by + 10);
    g.textAlign = "left"; g.textBaseline = "alphabetic";
  }
  function padShown() { return !!(padEl && padEl.offsetParent !== null); }

  function draw(alpha, time) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // the sky is transparent, so wipe last frame or moving things leave trails
    if (!staticLayer) buildStatic();
    ctx.drawImage(staticLayer, 0, 0);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / VH, 0, -VY0 * canvas.height / VH);
    if (CASTLE_ART.drawnDetails && !IMG.castle) drawDetails(ctx, time);
    drawMace(ctx);
    for (var i = 0; i < mobs.length; i++) {
      var m = mobs[i];
      if (!m.alive) continue;
      drawMob(ctx, m, m.px + (m.x - m.px) * alpha, m.py + (m.y - m.py) * alpha);
    }
    if (active) drawBubble(ctx, active, time);
    else if (!hintDone) drawHint(ctx, time);
    for (var p = 0; p < parts.length; p++) {
      var q = parts[p];
      ctx.globalAlpha = Math.max(0, q.life / q.max);
      circ(ctx, q.x, q.y, q.r, q.color, false);
    }
    ctx.globalAlpha = 1;
    drawFrog(ctx, frog.px + (frog.x - frog.px) * alpha, frog.py + (frog.y - frog.py) * alpha);
  }

  // ---- physics ----
  function solidAt(c, r) { return tile(c, r) === "#"; }

  function moveX(dt) {
    frog.x += frog.vx * dt;
    var r0 = Math.floor(frog.y / T), r1 = Math.floor((frog.y + FH - 0.01) / T), r, c;
    if (frog.vx > 0) {
      c = Math.floor((frog.x + FW - 0.01) / T);
      for (r = r0; r <= r1; r++) if (solidAt(c, r)) { frog.x = c * T - FW; frog.vx = 0; break; }
    } else if (frog.vx < 0) {
      c = Math.floor(frog.x / T);
      for (r = r0; r <= r1; r++) if (solidAt(c, r)) { frog.x = (c + 1) * T; frog.vx = 0; break; }
    }
    // the bed is solid from the sides
    if (overlap(frog.x, frog.y, FW, FH, BED.x, BED.y, BED.w, BED.h)) {
      if (frog.x + FW / 2 < BED.x + BED.w / 2) frog.x = BED.x - FW; else frog.x = BED.x + BED.w;
      frog.vx = 0;
    }
  }

  function moveY(dt) {
    var prevBottom = frog.y + FH;
    frog.y += frog.vy * dt;
    frog.grounded = false; frog.onBed = false;
    var c0 = Math.floor(frog.x / T), c1 = Math.floor((frog.x + FW - 0.01) / T), c, r;
    if (frog.vy > 0) {
      var bottom = frog.y + FH, landAt = Infinity;
      r = Math.floor((bottom - 0.01) / T);
      for (c = c0; c <= c1; c++) if (tile(c, r) === "#") landAt = Math.min(landAt, r * T);
      if (dropTimer <= 0) for (var pk = 0; pk < PLANKS.length; pk++) {
        var P = PLANKS[pk];
        if (frog.x + FW > P[0] && frog.x < P[1] && prevBottom <= P[2] + 0.5 && bottom >= P[2]) landAt = Math.min(landAt, P[2]);
      }
      if (landAt < Infinity) { land(landAt); return; }
      if (frog.x + FW > BED.x && frog.x < BED.x + BED.w && prevBottom <= BED.y + 0.5 && bottom >= BED.y) {
        if (frog.vy > 300) {
          frog.y = BED.y - FH; frog.vy = -Math.min(F.bed, frog.vy * 0.8 + 40); frog.squash = 1;
          puff(frog.x + FW / 2, BED.y, C.white, 4);
        } else { land(BED.y); frog.onBed = true; }
      }
    } else if (frog.vy < 0) {
      r = Math.floor(frog.y / T);
      for (c = c0; c <= c1; c++) if (solidAt(c, r)) { frog.y = (r + 1) * T; frog.vy = 0; return; }
    }
  }
  function land(top) {
    if (frog.vy > 260) frog.squash = Math.min(1, frog.vy / 500);
    frog.y = top - FH; frog.vy = 0; frog.grounded = true;
  }
  function overlap(ax, ay, aw, ah, bx, by, bw, bh) { return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by; }

  function puff(x, y, color, n) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 70;
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: 0.5, max: 0.5, color: color, r: 1.5 + Math.random() * 2 });
    }
  }

  function hurt() {
    if (frog.dead > 0 || frog.invuln > 0) return;
    puff(frog.x + FW / 2, frog.y + FH / 2, C.cyan, 12);
    puff(frog.x + FW / 2, frog.y + FH / 2, C.cobalt, 6);
    frog.dead = 0.7;
  }

  function step(dt) {
    t += dt;
    frog.px = frog.x; frog.py = frog.y;
    for (var i = 0; i < mobs.length; i++) { mobs[i].px = mobs[i].x; mobs[i].py = mobs[i].y; }

    updateMobs(dt);
    for (var p = parts.length - 1; p >= 0; p--) {
      var q = parts[p];
      q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 300 * dt; q.life -= dt;
      if (q.life <= 0) parts.splice(p, 1);
    }

    if (frog.dead > 0) {
      frog.dead -= dt;
      if (frog.dead <= 0) {
        resetFrog(checkpoint);
        frog.invuln = 1.2;
        puff(frog.x + FW / 2, frog.y + FH / 2, C.lime, 8);
      }
      return;
    }
    if (frog.invuln > 0) frog.invuln -= dt;
    if (frog.attack > 0) frog.attack -= dt;

    var dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (!dir) dir = stickAmount();
    var target = dir * F.run;
    var rate = dir === 0 ? (frog.grounded ? F.friction : F.airAccel * 0.6) : (frog.grounded ? F.accel : F.airAccel);
    if (frog.vx < target) frog.vx = Math.min(target, frog.vx + rate * dt);
    else if (frog.vx > target) frog.vx = Math.max(target, frog.vx - rate * dt);
    if (dir) frog.face = dir > 0 ? 1 : -1;
    frog.look += (frog.face - frog.look) * Math.min(1, dt * 20);

    coyote = frog.grounded ? F.coyote : Math.max(0, coyote - dt);
    if (jumpBuffer > 0) jumpBuffer -= dt;
    if (dropTimer > 0) dropTimer -= dt;
    if (jumpBuffer > 0 && coyote > 0) {
      frog.vy = frog.onBed ? -F.bed : -F.jump; jumpBuffer = 0; coyote = 0; frog.grounded = false; frog.squash = 0.4;
    }
    frog.vy = Math.min(F.fall, frog.vy + F.gravity * dt);
    frog.squash = Math.max(0, frog.squash - dt * 5);

    moveX(dt);
    moveY(dt);
    if (frog.grounded) coyote = F.coyote;

    // traps
    for (var s = 0; s < SPIKES.length; s++) {
      var sp = SPIKES[s];
      if (overlap(frog.x, frog.y, FW, FH, sp.x, sp.y, sp.w, sp.h)) { hurt(); return; }
    }
    for (var hz = 0; hz < HAZARDS.length; hz++) {
      var hh = HAZARDS[hz];
      if (overlap(frog.x + 1, frog.y + 1, FW - 2, FH - 2, hh.x, hh.y, hh.w, hh.h)) { hurt(); return; }
    }
    if (MACE) {
      var mp = macePos(maceAngle());
      var nx = Math.max(frog.x, Math.min(mp.x, frog.x + FW)), ny = Math.max(frog.y, Math.min(mp.y, frog.y + FH));
      if ((nx - mp.x) * (nx - mp.x) + (ny - mp.y) * (ny - mp.y) < (MACE.r + 2) * (MACE.r + 2)) { hurt(); return; }
    }

    // mobs: land on them to pop them, touch them any other way and you poof
    for (var k = 0; k < mobs.length; k++) {
      var m = mobs[k];
      if (!m.alive || !overlap(frog.x + 1, frog.y + 1, FW - 2, FH - 2, m.x, m.y, m.w, m.h)) continue;
      if (frog.vy > 0 && frog.py + FH <= m.py + 6) {
        m.alive = false; m.respawn = 5;
        puff(m.x + m.w / 2, m.y + m.h / 2, m.kind === "slime" ? C.lime : C.lav, 10);
        frog.vy = -F.stomp; frog.squash = 0.8; frog.attack = 0.32;
      } else { hurt(); return; }
    }

    // checkpoint: the room the Frog is standing in
    if (frog.grounded) {
      var room = roomAt(Math.floor((frog.x + FW / 2) / T), Math.floor((frog.y + FH / 2) / T));
      if (room && checkpoint.room !== room) checkpoint = spawnPoint(room);
    }

    // which glowing thing is the Frog standing at
    var fcx = frog.x + FW / 2, fcy = frog.y + FH / 2, found = null;
    for (var q2 = 0; q2 < CASTLE_SPOTS.length; q2++) {
      var z = CASTLE_SPOTS[q2].zone;
      if (fcx >= z[0] * T - 4 && fcx <= (z[0] + z[2]) * T + 4 && fcy >= z[1] * T - 4 && fcy <= (z[1] + z[3]) * T + 4) { found = CASTLE_SPOTS[q2]; break; }
    }
    if (found !== active) { active = found; if (enterBtn) enterBtn.classList.toggle("is-ready", !!active); }
  }

  function updateMobs(dt) {
    for (var i = 0; i < mobs.length; i++) {
      var m = mobs[i];
      m.t += dt;
      if (!m.alive) {
        m.respawn -= dt;
        if (m.respawn <= 0) { m.alive = true; m.x = m.px = m.x0; m.y = m.py = m.y0; puff(m.x + m.w / 2, m.y + m.h / 2, C.lavLight, 6); }
        continue;
      }
      if (m.kind === "slime" || m.kind === "bat") {
        m.x += m.vx * dt;
        if (m.x < m.min) { m.x = m.min; m.vx = Math.abs(m.vx); }
        if (m.x > m.max) { m.x = m.max; m.vx = -Math.abs(m.vx); }
        if (m.kind === "bat") m.y = m.y0 + Math.sin(m.t * 2.2) * 7;
      } else if (m.kind === "spider") {
        m.y = (m.low + m.high) / 2 + Math.sin(m.t * 1.3) * (m.high - m.low) / 2;
      }
    }
  }

  // ---- using a glowing thing ----
  function use(spot) {
    if (!spot) return;
    if (spot.action === "frogjump") {
      if (window.frogJump) window.frogJump.open();
      return;
    }
    saveSpot();
    if (spot.external) { window.open(spot.href, "_blank", "noopener"); return; }
    frame.classList.add("is-leaving");
    setTimeout(function () { location.href = base + spot.href; }, reduceMotion ? 0 : 260);
  }
  window.addEventListener("pageshow", function () { frame.classList.remove("is-leaving"); });

  // ---- loop ----
  function frameLoop(now) {
    if (!running) return;
    var dtf = Math.min((now - last) / 1000, 0.1);
    last = now;
    var overlayOpen = isOverlayOpen();
    if (!overlayOpen) {
      acc += dtf;
      while (acc >= STEP) { step(STEP); acc -= STEP; }
      draw(acc / STEP, now);
    }
    raf = requestAnimationFrame(frameLoop);
  }
  function start() {
    if (running) return;
    running = true; last = performance.now(); acc = 0;
    raf = requestAnimationFrame(frameLoop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function isOverlayOpen() {
    var o = document.getElementById("intro");
    return !!(o && !o.hidden);
  }

  // ---- sizing ----
  var narrowMq = window.matchMedia("(max-width: 760px)");
  var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  function fit() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cs = getComputedStyle(stage);
    var padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    var padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    var padH = padShown() ? padEl.offsetHeight + (parseFloat(cs.rowGap) || 0) : 0;
    // phones: the castle section hugs the castle, so measure against the screen, not the section
    var hdr = document.querySelector(".site-header");
    var roomH = narrowMq.matches ? window.innerHeight - (hdr ? hdr.offsetHeight : 64) : stage.clientHeight;
    var availH = Math.max(200, roomH - padY - padH - 2);
    var availW = stage.clientWidth - padX;
    scale = Math.min(availW / W, availH / VH);
    var cssW = Math.floor(W * scale), cssH = Math.floor(VH * scale);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    staticLayer = null;
    draw(1, performance.now());
    drawSpire(); measureSpire(); spireScroll();
  }
  if (window.ResizeObserver) new ResizeObserver(function () { fit(); }).observe(stage);
  else window.addEventListener("resize", fit);
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load('66px "Pirata One"'),
      document.fonts.load('15px "VT323"')
    ]).then(function () { staticLayer = null; }).catch(function () {});
  }

  // ---- only grab the keyboard while the castle is on screen ----
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].intersectionRatio >= 0.25;
      visible = entries[0].isIntersecting;
      if (!visible) engaged = false;
      if (visible) start(); else stop();
    }, { threshold: [0, 0.25, 0.5] }).observe(canvas);
  } else start();

  function typing() {
    var el = document.activeElement;
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
  }
  function captured() { return (inView || (engaged && visible)) && !isOverlayOpen() && !typing(); }

  document.addEventListener("keydown", function (e) {
    if (!captured() || e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key, handled = true;
    if (k === "ArrowLeft" || k === "a" || k === "A") { keys.left = true; hintDone = true; }
    else if (k === "ArrowRight" || k === "d" || k === "D") { keys.right = true; hintDone = true; }
    else if (k === "ArrowUp" || k === "w" || k === "W") { if (!e.repeat) { if (active && standingStill()) use(active); else { jumpBuffer = F.buffer; keys.jumpHeld = true; } } }
    else if (k === " " || k === "z" || k === "Z") { if (!e.repeat) { jumpBuffer = F.buffer; keys.jumpHeld = true; } }
    else if (k === "Enter" || k === "e" || k === "E") { if (active && !e.repeat) use(active); else handled = false; }
    else if (k === "ArrowDown" || k === "s" || k === "S") { if (frog.grounded) { dropTimer = 0.22; frog.y += 1; } }
    else handled = false;
    if (handled) e.preventDefault();
  });
  document.addEventListener("keyup", function (e) {
    var k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = false;
    if (k === "ArrowRight" || k === "d" || k === "D") keys.right = false;
    if (k === " " || k === "z" || k === "Z" || k === "ArrowUp" || k === "w" || k === "W") releaseJump();
  });
  function standingStill() { return frog.grounded && Math.abs(frog.vx) < 25; }
  function releaseJump() {
    keys.jumpHeld = false;
    if (frog.vy < -120) frog.vy *= F.jumpCut;
  }
  window.addEventListener("blur", function () { keys.left = keys.right = false; resetStick(); });

  // ---- phone buttons ----
  var enterBtn = stage.querySelector('[data-pad="enter"]');
  stage.querySelectorAll("[data-pad]").forEach(function (btn) {
    var which = btn.getAttribute("data-pad");
    var pressedAt = 0, holding = false;
    function down(e) {
      e.preventDefault();
      hintDone = true; engaged = true;
      if (which === "enter") {
        if (!active) return;                 // nothing to open here: ignore the tap
        btn.classList.add("is-down");
        holding = true;
        return;
      }
      if (btn.setPointerCapture && e.pointerId !== undefined) { try { btn.setPointerCapture(e.pointerId); } catch (err) {} }
      btn.classList.add("is-down");
      holding = true;
      pressedAt = performance.now();
      jumpBuffer = F.buffer; keys.jumpHeld = true;
    }
    function up(e) {
      if (!holding) return;
      holding = false;
      btn.classList.remove("is-down");
      if (which === "enter") {
        // only go in if the finger was lifted on the button itself, at a door
        var over = e && e.type === "pointerup" && document.elementFromPoint(e.clientX, e.clientY);
        if (over && btn.contains(over) && active) use(active);
        return;
      }
      // a tap shorter than this still counts as a full little hop instead of a twitch
      var held = performance.now() - pressedAt, MIN = 150;
      if (held < MIN) setTimeout(releaseJump, MIN - held); else releaseJump();
    }
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("pointerleave", function (e) { if (which === "enter" && holding) { holding = false; btn.classList.remove("is-down"); } });
    btn.addEventListener("lostpointercapture", up);
    btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  });

  // ---- the stick: drag sideways to walk (further = faster), push firmly down to drop through planks ----
  var stick = stage.querySelector("[data-stick]");
  var knob = stick && stick.querySelector(".stick-knob");
  var stickId = null, stickUp = false, stickDown = false;
  function stickAmount() {
    var a = Math.abs(pad.axis);
    if (a < 0.18) return 0;
    return (pad.axis > 0 ? 1 : -1) * Math.min(1, 0.35 + (a - 0.18) * 1.6);
  }
  function resetStick() {
    pad.axis = 0; stickId = null; stickUp = stickDown = false;
    if (knob) knob.style.transform = "";
    if (stick) stick.classList.remove("is-down");
  }
  function moveStick(e) {
    var r = stick.getBoundingClientRect();
    var R = r.width * 0.34;
    var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d > R) { dx = dx / d * R; dy = dy / d * R; }
    knob.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
    pad.axis = dx / R;
    var ny = dy / R;
    if (ny > 0.8 && Math.abs(pad.axis) < 0.5) { if (!stickDown && frog.grounded) { dropTimer = 0.22; frog.y += 1; } stickDown = true; }
    else if (ny < 0.3) stickDown = false;
  }
  if (stick && knob) {
    stick.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      stickId = e.pointerId;
      try { stick.setPointerCapture(e.pointerId); } catch (err) {}
      stick.classList.add("is-down");
      hintDone = true; engaged = true;
      moveStick(e);
    });
    stick.addEventListener("pointermove", function (e) { if (e.pointerId === stickId) moveStick(e); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (n) {
      stick.addEventListener(n, function (e) { if (e.pointerId === stickId) resetStick(); });
    });
    stick.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }

  // ---- click or tap a glowing thing to open it directly ----
  function spotAtPoint(e) {
    var r = canvas.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width * W, y = VY0 + (e.clientY - r.top) / r.height * VH;
    for (var i = 0; i < CASTLE_SPOTS.length; i++) {
      var z = CASTLE_SPOTS[i].zone;
      if (x >= z[0] * T - 6 && x <= (z[0] + z[2]) * T + 6 && y >= z[1] * T - 10 && y <= (z[1] + z[3]) * T + 4) return CASTLE_SPOTS[i];
    }
    return null;
  }
  canvas.addEventListener("pointerdown", function () {
    engaged = true;
    try { window.focus(); canvas.focus({ preventScroll: true }); } catch (err) {}
  });
  canvas.addEventListener("click", function (e) { var s = spotAtPoint(e); if (s) use(s); });
  canvas.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    canvas.style.cursor = spotAtPoint(e) ? "pointer" : "default";
  });

  // the "Arcade" link next to the castle opens Frog Jump too
  document.querySelectorAll("[data-play-frogjump]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (window.frogJump) { e.preventDefault(); window.frogJump.open(); }
    });
  });

  fit();

  // ---- testing helpers (browser console) ----
  window.castle = {
    get frog() { return frog; }, get active() { return active ? active.id : null; },
    get room() { return checkpoint.room.id; }, get mobs() { return mobs; },
    pause: function () { stop(); }, resume: function () { start(); },
    put: function (col, row) { frog.x = frog.px = col * T + (T - FW) / 2; frog.y = frog.py = row * T - FH; frog.vx = frog.vy = 0; },
    step: function (n) { for (var i = 0; i < (n || 1); i++) step(STEP); draw(1, performance.now()); },
    keys: keys,
    jump: function () { jumpBuffer = F.buffer; keys.jumpHeld = true; },
    release: releaseJump,
    layout: function (withGrid) {
      var keepW = canvas.width, keepH = canvas.height;
      var keepV = [VY0, VH]; VY0 = 0; VH = H;
      canvas.width = W * 2; canvas.height = H * 2; staticLayer = null;
      var savedTitle = CASTLE_ART.title.show; CASTLE_ART.title.show = !withGrid;
      buildStatic();
      var out = document.createElement("canvas"); out.width = W * 2; out.height = H * 2;
      var g = out.getContext("2d");
      g.drawImage(staticLayer, 0, 0);
      if (withGrid) {
        g.setTransform(2, 0, 0, 2, 0, 0);
        for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
          var ch = tile(c, r);
          if (ch === "#") { g.fillStyle = "rgba(61,35,214,0.35)"; g.fillRect(c * T, r * T, T, T); }
          if (ch === "=") { g.fillStyle = "rgba(51,196,230,0.7)"; g.fillRect(c * T, r * T, T, 7); }
        }
        g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 0.5;
        for (var gx = 0; gx <= W; gx += T) { g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx, H); g.stroke(); }
        for (var gy = 0; gy <= H; gy += T) { g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke(); }
        CASTLE_SPOTS.forEach(function (s) {
          var z = s.zone;
          g.strokeStyle = "#ff2d6f"; g.lineWidth = 1.5; g.strokeRect(z[0] * T, z[1] * T, z[2] * T, z[3] * T);
          g.fillStyle = "#ff2d6f"; g.font = "9px monospace"; g.fillText(s.id, z[0] * T + 2, z[1] * T + 9);
        });
      }
      CASTLE_ART.title.show = savedTitle;
      VY0 = keepV[0]; VH = keepV[1];
      canvas.width = keepW; canvas.height = keepH; staticLayer = null;
      return out.toDataURL("image/png");
    }
  };
})();
