/*
  FROG JUMP: the haunted castle
  ------------------------------
  The Frog climbs a castle floor by floor: Dungeon, Great Hall, Library,
  Bell Tower, then the Rooftops. Each floor adds new platforms, traps,
  monsters and power-ups, and the gaps between ledges keep growing.

  PLATFORMS                       (Doodle Jump equivalent)
    stone ledge                   green, normal
    ghost skateboard              blue, slides left and right
    chandelier                    grey, rides up and down
    ectoplasm plank               white, vanishes after one bounce
    rotten plank                  brown, breaks, no bounce
    cursed crate                  yellow/red, lights up and explodes
  TRAPS AND MONSTERS
    ghost, bat, spider            stomp them or lick them, touching them knocks you out
    the Maw                       black hole: pulls you in, can't be killed
  POWER-UPS
    mushroom                      spring
    bat wings                     propeller hat
    Ciruela                       jetpack (she carries the Frog up)
    skull lantern                 shield, absorbs one hit
    flies                         bonus points, eat them with your tongue

  SWAP IN YOUR OWN ART
  Put PNGs in assets/game/ and set the paths below. Anything left as null
  is drawn with the built-in placeholder shapes. Sizes are 2× the drawn
  size so they stay sharp on phones.
*/
var GAME_ASSETS = {
  frog: null,        // 96×96, facing right
  ledge: null,       // 156×36 platforms
  ghostboard: null,
  chandelier: null,
  ectoplasm: null,
  rotten: null,
  crate: null,
  mushroom: null,    // 40×40
  wings: null,       // 64×40
  ciruela: null,     // 128×64, the cat the Frog rides
  lantern: null,     // 44×52
  fly: null,         // 24×24
  ghost: null,       // 88×92
  bat: null,         // 84×56
  spider: null,      // 76×68
  maw: null          // 128×128
};

/*
  FEEL: tweak these to change how the game plays.
  Units are logical pixels (the playfield is 400 wide) and seconds.
*/
var GAME_FEEL = {
  gravity: 1350,       // how fast he falls
  jump: 740,           // bounce speed off a ledge (height ≈ jump² / (2 × gravity))
  springJump: 1180,    // bounce speed off a mushroom
  maxRun: 330,         // top sideways speed
  accel: 2600,         // how fast he reaches top speed while steering
  airDrag: 1500,       // how fast he slows down when you let go
  tiltRange: 22,       // phone tilt in degrees for full speed
  wingsSpeed: 640, wingsTime: 2.2,
  ciruelaSpeed: 1000, ciruelaTime: 2.8,
  shieldTime: 12,
  tongueReach: 175
};

(function () {
  var intro = document.getElementById("intro");
  if (!intro) return;

  var base = document.body.getAttribute("data-base") || "";
  var canvas = intro.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  var screens = {
    title: intro.querySelector('[data-screen="title"]'),
    over: intro.querySelector('[data-screen="over"]')
  };
  var scoreOut = intro.querySelector("[data-score]");
  var bestOut = intro.querySelectorAll("[data-best]");
  var causeOut = intro.querySelector("[data-cause]");
  var floorOut = intro.querySelector("[data-floor]");
  var hint = intro.querySelector(".intro-hint");
  var tongueBtn = intro.querySelector("[data-tongue]");
  var coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- palette (site tokens + a few game-only colors) ----
  var css = getComputedStyle(document.documentElement);
  function tok(name, fallback) { return (css.getPropertyValue(name) || "").trim() || fallback; }
  var C = {
    night: tok("--night", "#0f0b1a"),
    crypt: tok("--crypt", "#1b1428"),
    thorn: tok("--thorn", "#3a2a52"),
    mist: tok("--mist", "#a99cc4"),
    bone: tok("--bone", "#efe3cc"),
    candle: tok("--candle", "#f2b24c"),
    moss: tok("--moss", "#8fc46a"),
    blood: tok("--blood", "#d9485f"),
    frog: "#8fc46a", frogDark: "#4d7a3a",
    stone: "#b9ad9c", stoneDark: "#7d7166",
    wood: "#6e4a32", woodDark: "#47301f",
    iron: "#4a4358", ghost: "#ece6ff", ecto: "#9ff2d6",
    tongue: "#ff7aa8", plum: "#6b5f86"
  };

  // ---- optional sprites ----
  var IMG = {};
  Object.keys(GAME_ASSETS).forEach(function (k) {
    if (!GAME_ASSETS[k]) return;
    var im = new Image();
    im.onload = function () { IMG[k] = im; };
    im.src = base + GAME_ASSETS[k];
  });

  // ---- world ----
  var W = 400, H = 640;
  var PW = 78, PH = 14;
  var FROG = 40;
  var STEP = 1 / 120;
  var TILE = 260;          // background tile height
  var F = GAME_FEEL;

  /*
    FLOORS: the castle, bottom to top. "at" is the score where it starts.
    chain   = odds for the platforms you climb on
    rotten / crate = odds of a trap platform in each gap
    monster = odds of a monster in a gap, and which ones
    power   = odds of a power-up on a ledge, and which ones
  */
  var FLOORS = [
    { at: 0, name: "The Dungeon", wall: "#1f1a26", mortar: "#0d0a12", moss: true,
      deco: ["barred", "chains", "torch", "skulls", "torch", "cobweb", "barred"],
      chain: { ledge: 1 }, rotten: 0.16, crate: 0,
      monster: 0.05, monsters: ["ghost"], power: 0.02, powers: ["wings"] },
    { at: 700, name: "The Great Hall", wall: "#221a2f", mortar: "#0f0a16",
      deco: ["window", "banner", "torch", "portrait", "window", "torch", "banner"],
      chain: { ledge: 0.75, ghostboard: 0.25 }, rotten: 0.22, crate: 0,
      monster: 0.07, monsters: ["bat", "ghost", "bat"], power: 0.03, powers: ["wings", "ciruela"] },
    { at: 1800, name: "The Library", wall: "#201823", mortar: "#0d080f",
      deco: ["shelf", "portrait", "candles", "window", "shelf", "candles", "cobweb"],
      chain: { ledge: 0.55, ghostboard: 0.2, ectoplasm: 0.15, chandelier: 0.1 }, rotten: 0.24, crate: 0.07,
      monster: 0.09, monsters: ["ghost", "bat", "spider"], power: 0.035, powers: ["wings", "ciruela", "lantern"] },
    { at: 3200, name: "The Bell Tower", wall: "#1b1f2c", mortar: "#0b0d14",
      deco: ["bell", "window", "torch", "cobweb", "bell", "rope", "portrait"],
      chain: { ledge: 0.45, ghostboard: 0.2, ectoplasm: 0.15, chandelier: 0.2 }, rotten: 0.26, crate: 0.13,
      monster: 0.11, monsters: ["ghost", "bat", "spider", "spider", "maw"], power: 0.04, powers: ["wings", "ciruela", "lantern"] },
    { at: 5000, name: "The Rooftops", sky: true,
      chain: { ledge: 0.35, ghostboard: 0.25, ectoplasm: 0.2, chandelier: 0.2 }, rotten: 0.3, crate: 0.16,
      monster: 0.13, monsters: ["ghost", "bat", "spider", "maw", "bat"], power: 0.045, powers: ["wings", "ciruela", "lantern"] }
  ];
  function floorIndexAt(s) {
    for (var i = FLOORS.length - 1; i >= 0; i--) if (s >= FLOORS[i].at) return i;
    return 0;
  }

  var CAUSES = {
    fell: "The Frog fell into the dark",
    ghost: "A ghost spooked the Frog",
    bat: "A bat knocked the Frog out",
    spider: "The spider got the Frog",
    maw: "The Maw swallowed the Frog"
  };

  // deterministic noise for background decor
  function hash(n) {
    n = (n | 0) ^ 0x9e3779b9;
    n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
    n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
    n ^= n >>> 16;
    return (n >>> 0) / 4294967296;
  }
  function rnd(k, i) { return hash(k * 7919 + i * 104729 + 17); }
  function pick(obj) {
    var r = Math.random(), sum = 0, k;
    for (k in obj) sum += obj[k];
    r *= sum;
    for (k in obj) { r -= obj[k]; if (r <= 0) return k; }
    return k;
  }
  function choice(a) { return a[Math.floor(Math.random() * a.length)]; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  // ---- state ----
  var state = "title";
  var frog, plats, mons, flies, parts, texts;
  var camY = 0, prevCam = 0, score = 0, bonus = 0, best = 0, floorIdx = 0;
  var nextY, lastMonWU, lastPowWU, shake = 0, banner = null;
  var last = 0, acc = 0, raf = 0, idleRaf = 0;
  var input = 0, tilt = null;
  var motes = [];
  var t0 = performance.now();
  var god = false;

  for (var mi = 0; mi < 22; mi++) motes.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + 0.6, p: Math.random() * 6.28, d: Math.random() * 0.3 + 0.1 });

  try { best = parseInt(localStorage.getItem("cd-frog-best") || "0", 10) || 0; } catch (e) {}
  bestOut.forEach(function (el) { el.textContent = best; });

  // ---- pre-rendered layers ----
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var f = amt < 0 ? 0 : 255, t = Math.abs(amt);
    r = Math.round((f - r) * t + r); g = Math.round((f - g) * t + g); b = Math.round((f - b) * t + b);
    return "rgb(" + r + "," + g + "," + b + ")";
  }
  function rrOn(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  function rr(x, y, w, h, r) { rrOn(ctx, x, y, w, h, r); }

  var walls = FLOORS.map(function (fl, fi) {
    if (fl.sky) return null;
    var c = document.createElement("canvas");
    c.width = W * 2; c.height = TILE * 2;
    var g = c.getContext("2d");
    g.scale(2, 2);
    g.fillStyle = fl.mortar;
    g.fillRect(0, 0, W, TILE);
    var bw = 52, bh = 26, seed = fi * 1000;
    for (var row = 0; row < TILE / bh; row++) {
      var off = row % 2 ? bw / 2 : 0;
      for (var x = -bw, col = 0; x < W + bw; x += bw, col++) {
        var v = (rnd(seed + row, col) - 0.5) * 0.2;
        g.fillStyle = v < 0 ? shade(fl.wall, v) : shade(fl.wall, v * 0.6);
        rrOn(g, x + off + 1.5, row * bh + 1.5, bw - 3, bh - 3, 3);
        g.fill();
        g.fillStyle = "rgba(255,255,255,0.035)";
        g.fillRect(x + off + 3, row * bh + 2, bw - 6, 2);
        if (fl.moss && rnd(seed + row, col + 50) < 0.18) {
          g.fillStyle = "rgba(110,150,80,0.35)";
          for (var m = 0; m < 6; m++) {
            g.beginPath();
            g.arc(x + off + 6 + rnd(row, col * 9 + m) * (bw - 12), row * bh + bh - 3 - rnd(col, row * 7 + m) * 4, 1.6 + rnd(m, col) * 1.6, 0, 7);
            g.fill();
          }
        }
        if (rnd(seed + row, col + 90) < 0.06) {
          g.strokeStyle = "rgba(0,0,0,0.45)";
          g.lineWidth = 1;
          g.beginPath();
          var cx = x + off + 10 + rnd(row, col) * 30, cy = row * bh + 4;
          g.moveTo(cx, cy); g.lineTo(cx + 4, cy + 7); g.lineTo(cx - 1, cy + 13); g.lineTo(cx + 3, cy + 20);
          g.stroke();
        }
      }
    }
    return c;
  });

  var vignette = (function () {
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var g = c.getContext("2d");
    var gr = g.createRadialGradient(W / 2, H * 0.48, 140, W / 2, H * 0.48, 470);
    gr.addColorStop(0, "rgba(6,3,12,0)");
    gr.addColorStop(1, "rgba(6,3,12,0.82)");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    return c;
  })();

  // ---- sizing ----
  function fit() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var box = canvas.parentElement.getBoundingClientRect();
    var scale = Math.min(box.width / W, box.height / H);
    canvas.style.width = Math.floor(W * scale) + "px";
    canvas.style.height = Math.floor(H * scale) + "px";
    canvas.width = Math.floor(W * scale * dpr);
    canvas.height = Math.floor(H * scale * dpr);
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    if (state !== "play") draw(1);
  }
  window.addEventListener("resize", fit);
  if (window.ResizeObserver) new ResizeObserver(function () { fit(); }).observe(canvas.parentElement);

  // ---- level generation ----
  function worldUpAt(y) { return camY + (H - y); }

  function makePlat(kind, y, d) {
    var x = Math.random() * (W - PW);
    var p = { kind: kind, x: x, y: y, px: x, py: y, vx: 0, vy: 0, travel: 0, range: 0,
      broken: false, gone: false, fall: 0, fade: 1, spring: false, springT: 0, item: null, fuse: -1, t: Math.random() * 6 };
    if (kind === "ghostboard") p.vx = (Math.random() < 0.5 ? -1 : 1) * (50 + 100 * d);
    if (kind === "chandelier") { p.vy = (Math.random() < 0.5 ? -1 : 1) * (40 + 40 * d); p.range = 34; }
    return p;
  }

  function placeAway(p, from) {
    for (var i = 0; i < 6; i++) {
      var x = Math.random() * (W - PW);
      if (Math.abs(x - from.x) > PW + 12) { p.x = p.px = x; return; }
    }
    p.x = p.px = (from.x + W / 2) % (W - PW);
  }

  function spawnRow() {
    var prevY = nextY;
    var hs = worldUpAt(prevY) / 4;
    var fi = floorIndexAt(hs), fl = FLOORS[fi];
    var d = Math.min(hs / 6000, 1);
    var kind = pick(fl.chain);
    var gap = 58 + d * 110 + Math.random() * (22 + d * 20);
    if (kind === "chandelier") gap = Math.min(gap, 135);
    gap = Math.min(gap, 178);
    nextY -= gap;

    var p = makePlat(kind, nextY, d);
    var wu = worldUpAt(nextY);
    if (kind === "ledge") {
      if (wu - lastPowWU > 1600 && Math.random() < fl.power) { p.item = choice(fl.powers); lastPowWU = wu; }
      else if (Math.random() < 0.07) p.spring = true;
    }
    plats.push(p);

    // a trap platform in the gap, away from the real one
    if (gap > 72) {
      var midY = prevY - gap * 0.5;
      if (hs > 150 && Math.random() < fl.rotten) { var r = makePlat("rotten", midY, d); placeAway(r, p); plats.push(r); }
      else if (Math.random() < fl.crate) { var c = makePlat("crate", midY, d); placeAway(c, p); plats.push(c); }
    }

    // flies to snack on
    if (Math.random() < 0.1) flies.push({ x: 24 + Math.random() * (W - 48), y: nextY - 30 - Math.random() * 40, px: 0, py: 0, t: Math.random() * 6, dead: false });

    // monsters live in the bigger gaps
    var mwu = worldUpAt(prevY - gap / 2);
    if (gap > 84 && hs > 450 && mwu - lastMonWU > 460 && Math.random() < fl.monster) {
      spawnMonster(choice(fl.monsters), prevY - gap / 2, p, d);
      lastMonWU = mwu;
    }
  }

  function spawnMonster(kind, cy, p, d) {
    var m = { kind: kind, x: 0, y: 0, px: 0, py: 0, w: 40, h: 40, vx: 0, t: Math.random() * 6, anchor: 0, dead: false };
    if (kind === "ghost") { m.w = 44; m.h = 46; m.vx = (Math.random() < 0.5 ? -1 : 1) * (30 + 40 * d); }
    if (kind === "bat") { m.w = 42; m.h = 28; m.vx = (Math.random() < 0.5 ? -1 : 1) * (80 + 60 * d); }
    if (kind === "spider") { m.w = 38; m.h = 34; m.anchor = cy - 110; }
    if (kind === "maw") { m.w = 64; m.h = 64; }
    m.y = cy - m.h / 2;
    if (kind === "maw") {
      // keep the Maw on the far side from the ledge you need
      var pc = p.x + PW / 2;
      m.x = pc < W / 2 ? W - m.w - 18 - Math.random() * 60 : 18 + Math.random() * 60;
    } else {
      m.x = Math.random() * (W - m.w);
    }
    m.px = m.x; m.py = m.y;
    mons.push(m);
  }

  function reset() {
    frog = { x: W / 2 - FROG / 2, y: H - 50 - FROG, px: 0, py: 0, vx: 0, vy: -F.jump, face: 1, look: 1, squash: 0,
      power: null, powerT: 0, powerMax: 1, shield: 0, dead: null, deadT: 0, spin: 0, sx: 0, sy: 0,
      tongue: -1, blink: 0 };
    frog.px = frog.x; frog.py = frog.y;
    plats = []; mons = []; flies = []; parts = []; texts = [];
    camY = prevCam = 0; score = 0; bonus = 0; floorIdx = 0; shake = 0;
    banner = { t: 0, name: FLOORS[0].name, num: 1 };
    acc = 0;
    var first = makePlat("ledge", H - 50, 0);
    first.x = first.px = W / 2 - PW / 2;
    plats.push(first);
    nextY = H - 50;
    lastMonWU = 0; lastPowWU = 600;
    while (nextY > -H) spawnRow();
  }

  // ---- effects ----
  function burst(x, y, color, n, speed, grav) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, s = speed * (0.4 + Math.random() * 0.6);
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: grav, life: 0.5 + Math.random() * 0.4, max: 0.9, color: color, r: 1.5 + Math.random() * 2.5 });
    }
  }
  function floatText(x, y, text, color) { texts.push({ x: x, y: y, text: text, life: 1, color: color || C.candle }); }
  function addBonus(n, x, y) { bonus += n; floatText(x, y, "+" + n); }

  function killMonster(m, how) {
    if (m.dead) return;
    m.dead = true;
    var cx = m.x + m.w / 2, cy = m.y + m.h / 2;
    burst(cx, cy, m.kind === "ghost" ? C.ghost : m.kind === "bat" ? "#7d62a8" : "#3d3350", 16, 160, 120);
    addBonus(how === "stomp" ? 100 : 75, cx, cy);
  }

  function die(cause) {
    if (frog.dead || god) return;
    frog.dead = cause;
    frog.deadT = 0;
    frog.power = null;
    frog.vy = -320;
    frog.vx *= 0.3;
    shake = 0.35;
    burst(frog.x + FROG / 2, frog.y + FROG / 2, C.candle, 10, 140, 0);
  }

  // ---- one fixed physics step ----
  function step(dt) {
    prevCam = camY;
    frog.px = frog.x; frog.py = frog.y;
    var i, p, m;
    for (i = 0; i < plats.length; i++) { plats[i].px = plats[i].x; plats[i].py = plats[i].y; }
    for (i = 0; i < mons.length; i++) { mons[i].px = mons[i].x; mons[i].py = mons[i].y; }
    for (i = 0; i < flies.length; i++) { flies[i].px = flies[i].x; flies[i].py = flies[i].y; }

    if (frog.dead === "maw") {
      frog.deadT += dt;
      frog.x = lerp(frog.x, frog.sx - FROG / 2, Math.min(1, dt * 6));
      frog.y = lerp(frog.y, frog.sy - FROG / 2, Math.min(1, dt * 6));
      frog.spin += dt * 14;
      if (frog.deadT > 0.85) gameOver("maw");
      updateWorld(dt);
      return;
    }

    // ---- sideways ----
    if (!frog.dead) {
      var target = input * F.maxRun;
      var rate = input === 0 ? F.airDrag : (Math.sign(target) === Math.sign(frog.vx || target) ? F.accel : F.accel * 1.4);
      if (frog.vx < target) frog.vx = Math.min(target, frog.vx + rate * dt);
      else if (frog.vx > target) frog.vx = Math.max(target, frog.vx - rate * dt);
      if (input > 0.15) frog.face = 1; else if (input < -0.15) frog.face = -1;
    }
    frog.x += frog.vx * dt;
    frog.look += (frog.face - frog.look) * Math.min(1, dt * 18);
    if (frog.x + FROG / 2 > W) { frog.x -= W; frog.px -= W; }
    if (frog.x + FROG / 2 < 0) { frog.x += W; frog.px += W; }

    // ---- up and down ----
    var prevBottom = frog.y + FROG;
    if (frog.power) {
      var speed = frog.power === "ciruela" ? F.ciruelaSpeed : F.wingsSpeed;
      frog.vy += (-speed - frog.vy) * Math.min(1, dt * 7);
      frog.powerT -= dt;
      if (Math.random() < 0.5) parts.push({ x: frog.x + FROG / 2 + (Math.random() - 0.5) * 30, y: frog.y + FROG + 10, vx: (Math.random() - 0.5) * 40, vy: 120, g: 0, life: 0.4, max: 0.4, color: frog.power === "ciruela" ? C.mist : C.candle, r: 2 });
      if (frog.powerT <= 0) { frog.power = null; frog.vy = Math.min(frog.vy, -F.jump * 0.6); }
    } else {
      frog.vy += F.gravity * dt;
    }
    frog.y += frog.vy * dt;
    frog.squash = Math.max(0, frog.squash - dt * 5);
    if (frog.shield > 0) frog.shield -= dt;
    if (frog.dead) frog.spin += dt * 9;

    // ---- tongue ----
    if (frog.tongue >= 0) {
      frog.tongue += dt;
      if (frog.tongue > 0.26) frog.tongue = -1;
      else tongueHits();
    }

    updateWorld(dt);
    if (!frog.dead) {
      landings(prevBottom);
      pickups();
      monsterContact(prevBottom, dt);
    }

    // ---- camera ----
    var line = H * 0.42;
    if (!frog.dead && frog.y < line) {
      var shift = line - frog.y;
      frog.y = line;
      for (i = 0; i < plats.length; i++) plats[i].y += shift;
      for (i = 0; i < mons.length; i++) { mons[i].y += shift; mons[i].anchor += shift; }
      for (i = 0; i < flies.length; i++) flies[i].y += shift;
      for (i = 0; i < parts.length; i++) parts[i].y += shift;
      for (i = 0; i < texts.length; i++) texts[i].y += shift;
      nextY += shift;
      camY += shift;
    }

    var hs = Math.floor(camY / 4);
    score = hs + bonus;
    var nf = floorIndexAt(hs);
    if (nf > floorIdx) { floorIdx = nf; banner = { t: 0, name: FLOORS[nf].name, num: nf + 1 }; }
    if (banner) { banner.t += dt; if (banner.t > 3) banner = null; }

    // ---- recycle and grow ----
    plats = plats.filter(function (q) { return q.y < H + 80 && !q.gone; });
    mons = mons.filter(function (q) { return q.y < H + 120 && !q.dead; });
    flies = flies.filter(function (q) { return q.y < H + 40 && !q.dead; });
    while (nextY > -60) spawnRow();

    // ---- falling out ----
    if (frog.y > H + 30) {
      if (god) { frog.y = H - FROG; frog.vy = -F.springJump; }
      else gameOver(frog.dead || "fell");
    }
  }

  function updateWorld(dt) {
    var i, p, m;
    for (i = 0; i < plats.length; i++) {
      p = plats[i];
      p.t += dt;
      if (p.kind === "ghostboard") {
        p.x += p.vx * dt;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > W - PW) { p.x = W - PW; p.vx *= -1; }
      }
      if (p.kind === "chandelier") {
        p.y += p.vy * dt; p.travel += p.vy * dt;
        if (Math.abs(p.travel) > p.range) { p.vy *= -1; p.travel = clamp(p.travel, -p.range, p.range); }
      }
      if (p.kind === "crate" && !p.gone) {
        if (p.fuse < 0 && p.y > 20) p.fuse = 2.6;
        if (p.fuse > 0) {
          p.fuse -= dt;
          if (p.fuse <= 0) {
            p.gone = true;
            burst(p.x + PW / 2, p.y, C.candle, 22, 260, 200);
            burst(p.x + PW / 2, p.y, C.blood, 10, 200, 200);
            shake = Math.max(shake, 0.25);
          }
        }
      }
      if (p.kind === "rotten" && p.broken) { p.fall += 900 * dt; p.y += p.fall * dt; }
      if (p.kind === "ectoplasm" && p.broken) { p.fade -= dt * 3.5; if (p.fade <= 0) p.gone = true; }
      if (p.springT > 0) p.springT -= dt;
    }
    for (i = 0; i < mons.length; i++) {
      m = mons[i];
      m.t += dt;
      if (m.kind === "ghost") {
        m.x += m.vx * dt;
        if (m.x < 0 || m.x > W - m.w) { m.vx *= -1; m.x = clamp(m.x, 0, W - m.w); }
        m.y += Math.cos(m.t * 2) * 14 * dt;
      } else if (m.kind === "bat") {
        m.x += m.vx * dt;
        if (m.x > W) m.x -= W + m.w;
        if (m.x < -m.w) m.x += W + m.w;
        m.y += Math.cos(m.t * 5) * 45 * dt;
      } else if (m.kind === "spider") {
        m.y = m.anchor + 70 + Math.sin(m.t * 1.4) * 42;
      }
    }
    for (i = 0; i < flies.length; i++) {
      flies[i].t += dt;
      flies[i].x += Math.cos(flies[i].t * 3) * 30 * dt;
      flies[i].y += Math.sin(flies[i].t * 4.3) * 20 * dt;
    }
    for (i = parts.length - 1; i >= 0; i--) {
      var q = parts[i];
      q.x += q.vx * dt; q.y += q.vy * dt; q.vy += q.g * dt; q.life -= dt;
      if (q.life <= 0) parts.splice(i, 1);
    }
    for (i = texts.length - 1; i >= 0; i--) {
      texts[i].y -= 34 * dt; texts[i].life -= dt;
      if (texts[i].life <= 0) texts.splice(i, 1);
    }
    if (shake > 0) shake -= dt;
  }

  function overlapsX(fx, q) { return fx + FROG - 9 > q.x && fx + 9 < q.x + PW; }

  function landings(prevBottom) {
    if (frog.vy <= 0 || frog.power) return;
    var bottom = frog.y + FROG;
    for (var k = 0; k < plats.length; k++) {
      var q = plats[k];
      if (q.broken || q.gone) continue;
      if (prevBottom > q.y + 3 || bottom < q.y) continue;
      if (!(overlapsX(frog.x, q) || overlapsX(frog.x - W, q) || overlapsX(frog.x + W, q))) continue;
      if (q.kind === "rotten") {
        q.broken = true;
        burst(q.x + PW / 2, q.y + 4, C.wood, 12, 120, 500);
        continue; // no bounce, keep falling
      }
      frog.y = q.y - FROG;
      var onSpring = q.spring && Math.abs(frog.x + FROG / 2 - (q.x + PW / 2)) < 22;
      frog.vy = onSpring ? -F.springJump : -F.jump;
      if (onSpring) q.springT = 0.25;
      frog.squash = 1;
      burst(frog.x + FROG / 2, q.y, "rgba(239,227,204,0.6)", 4, 60, 0);
      if (q.kind === "ectoplasm") q.broken = true;
      break;
    }
  }

  function pickups() {
    var fx = frog.x + 6, fy = frog.y + 4, fw = FROG - 12, fh = FROG - 4;
    for (var i = 0; i < plats.length; i++) {
      var p = plats[i];
      if (!p.item) continue;
      var ix = p.x + PW / 2 - 14, iy = p.y - 30;
      if (fx < ix + 28 && fx + fw > ix && fy < iy + 30 && fy + fh > iy) {
        if (p.item === "lantern") { frog.shield = F.shieldTime; floatText(ix, iy, "shield!", C.candle); }
        else {
          frog.power = p.item;
          frog.powerT = frog.powerMax = p.item === "ciruela" ? F.ciruelaTime : F.wingsTime;
          floatText(ix, iy, p.item === "ciruela" ? "Ciruela!" : "wings!", C.candle);
        }
        p.item = null;
      }
    }
    for (var j = 0; j < flies.length; j++) {
      var f = flies[j];
      if (!f.dead && Math.abs(f.x - (frog.x + FROG / 2)) < 22 && Math.abs(f.y - (frog.y + FROG / 2)) < 24) {
        f.dead = true; addBonus(25, f.x, f.y);
      }
    }
  }

  function monsterContact(prevBottom, dt) {
    var fx = frog.x + 7, fy = frog.y + 6, fw = FROG - 14, fh = FROG - 8;
    var fcx = frog.x + FROG / 2, fcy = frog.y + FROG / 2;
    for (var i = 0; i < mons.length; i++) {
      var m = mons[i];
      if (m.dead) continue;
      if (m.kind === "maw") {
        var cx = m.x + m.w / 2, cy = m.y + m.h / 2;
        var dx = cx - fcx, dy = cy - fcy, dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (frog.power) continue;
        if (dist < 125) {
          var pull = 1 - dist / 125;
          frog.x += dx / dist * pull * 240 * dt;
          frog.y += dy / dist * pull * 150 * dt;
        }
        if (dist < 26 && !god) { frog.dead = "maw"; frog.deadT = 0; frog.sx = cx; frog.sy = cy; shake = 0.3; }
        continue;
      }
      if (fx < m.x + m.w - 4 && fx + fw > m.x + 4 && fy < m.y + m.h - 4 && fy + fh > m.y + 4) {
        if (frog.power) { killMonster(m, "fly"); continue; }
        if (frog.vy > 0 && prevBottom <= m.y + m.h * 0.5) {
          killMonster(m, "stomp");
          frog.vy = -F.jump * 1.05;
          frog.squash = 1;
          continue;
        }
        if (frog.shield > 0) { killMonster(m, "shield"); frog.shield = 0; shake = 0.2; continue; }
        die(m.kind);
        return;
      }
    }
  }

  function tongueBase() { return { x: frog.x + FROG / 2 + frog.face * 3, y: frog.y + 16 }; }
  function tongueLen() { return frog.tongue < 0 ? 0 : Math.sin(Math.PI * frog.tongue / 0.26) * F.tongueReach; }
  function tongueHits() {
    var b = tongueBase(), len = tongueLen(), top = b.y - len;
    for (var i = 0; i < mons.length; i++) {
      var m = mons[i];
      if (m.dead || m.kind === "maw") continue;
      if (b.x > m.x - 6 && b.x < m.x + m.w + 6 && top < m.y + m.h && b.y > m.y) killMonster(m, "lick");
    }
    for (var j = 0; j < flies.length; j++) {
      var f = flies[j];
      if (!f.dead && Math.abs(f.x - b.x) < 16 && f.y > top && f.y < b.y) { f.dead = true; addBonus(25, f.x, f.y); }
    }
  }
  function lick() {
    if (state !== "play" || frog.dead || frog.tongue >= 0) return;
    frog.tongue = 0;
  }

  // ---- drawing: background ----
  function floorOfTile(k) { return floorIndexAt(Math.max(0, (k * TILE - H * 0.5) / 2)); }

  var skyGrad = null;
  function drawBackground(cam, time) {
    if (!skyGrad) {
      skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#0b0918"); skyGrad.addColorStop(1, "#1d1436");
    }
    var v0 = cam * 0.5;
    var kBot = Math.floor(v0 / TILE), kTop = Math.floor((v0 + H) / TILE);
    var k, y, fi, skyBottom = -1;

    for (k = kBot; k <= kTop; k++) {
      y = H + v0 - (k + 1) * TILE;
      fi = floorOfTile(k);
      if (FLOORS[fi].sky) {
        skyBottom = Math.max(skyBottom, y + TILE);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, y - 1, W, TILE + 2);
        for (var s = 0; s < 12; s++) {
          var a = 0.3 + 0.5 * Math.abs(Math.sin(time / 900 + s + k));
          ctx.fillStyle = "rgba(239,227,204," + a.toFixed(2) + ")";
          ctx.fillRect(rnd(k, s) * W, y + rnd(k, s + 40) * TILE, 2, 2);
        }
      } else {
        ctx.drawImage(walls[fi], 0, y, W, TILE);
      }
    }
    if (skyBottom > 0) drawMoon(Math.min(130, skyBottom - 120), skyBottom, time);

    for (k = kBot; k <= kTop; k++) {
      y = H + v0 - (k + 1) * TILE;
      fi = floorOfTile(k);
      if (!FLOORS[fi].sky) drawDecorRow(k, y, FLOORS[fi], time);
    }
    for (k = kBot; k <= kTop + 1; k++) {
      var a2 = floorOfTile(k), b2 = floorOfTile(k - 1);
      if (a2 !== b2) drawDivider(H + v0 - k * TILE, FLOORS[a2], time);
    }

    // drifting dust and embers
    for (var m = 0; m < motes.length; m++) {
      var mo = motes[m];
      var yy = ((mo.y + cam * mo.d) % (H + 20) + H + 20) % (H + 20) - 10;
      var xx = mo.x + Math.sin(time / 1300 + mo.p) * 8;
      var al = 0.25 + 0.3 * Math.sin(time / 700 + mo.p);
      ctx.fillStyle = "rgba(242,178,76," + Math.max(0, al).toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(xx, yy, mo.r, 0, 7); ctx.fill();
    }
  }

  function drawMoon(my, clipBottom, time) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, clipBottom); ctx.clip();
    var halo = ctx.createRadialGradient(300, my, 10, 300, my, 130);
    halo.addColorStop(0, "rgba(239,227,204,0.16)");
    halo.addColorStop(1, "rgba(239,227,204,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(160, my - 140, 280, 280);
    ctx.save();
    ctx.beginPath(); ctx.arc(300, my, 36, 0, 7); ctx.clip();
    ctx.fillStyle = C.bone;
    ctx.beginPath();
    ctx.rect(260, my - 40, 80, 80);
    ctx.arc(285, my - 9, 31, 0, 7);
    ctx.fill("evenodd");
    ctx.restore();
    // a sleepy face on the crescent
    ctx.fillStyle = "#3a2f4f";
    ctx.beginPath(); ctx.arc(322, my + 2, 2.2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(318, my + 16, 1.6, 0, 7); ctx.fill();
    ctx.restore();
  }

  function drawDecorRow(k, y, fl, time) {
    var n = rnd(k, 1) < 0.6 ? 2 : 1;
    var slots = rnd(k, 2) < 0.5 ? [68, 332, 200] : [332, 68, 200];
    for (var i = 0; i < n; i++) {
      var kind = fl.deco[Math.floor(rnd(k, 10 + i) * fl.deco.length)];
      var x = slots[i];
      var yy = y + 50 + rnd(k, 20 + i) * 120;
      ctx.save();
      ctx.globalAlpha = 0.92;
      DECOR[kind](x, yy, time, k + i);
      ctx.restore();
    }
  }

  function glow(x, y, r, a, color) {
    var g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, color || "rgba(242,178,76," + a + ")");
    g.addColorStop(1, "rgba(242,178,76,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function flame(x, y, s, time, seed) {
    var f = 1 + Math.sin(time / 90 + seed) * 0.12 + Math.sin(time / 37 + seed * 3) * 0.08;
    ctx.fillStyle = "#f28a2e";
    ctx.beginPath(); ctx.ellipse(x, y - 6 * s * f, 4 * s, 8 * s * f, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#ffe08a";
    ctx.beginPath(); ctx.ellipse(x, y - 4 * s * f, 2 * s, 4.5 * s * f, 0, 0, 7); ctx.fill();
    return f;
  }

  var DECOR = {
    torch: function (x, y, time, seed) {
      ctx.fillStyle = "#1d1822";
      ctx.fillRect(x - 3, y, 6, 22);
      ctx.fillRect(x - 9, y - 2, 18, 5);
      var f = flame(x, y - 2, 1.3, time, seed);
      glow(x, y - 10, 80 * f, 0.22);
    },
    window: function (x, y, time, seed) {
      ctx.fillStyle = "#14101c";
      ctx.beginPath(); ctx.moveTo(x - 32, y + 50); ctx.lineTo(x - 32, y - 10); ctx.arc(x, y - 10, 32, Math.PI, 0); ctx.lineTo(x + 32, y + 50); ctx.closePath(); ctx.fill();
      var g = ctx.createLinearGradient(0, y - 40, 0, y + 46);
      g.addColorStop(0, "#1a1f3d"); g.addColorStop(1, "#2a1d44");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - 25, y + 46); ctx.lineTo(x - 25, y - 10); ctx.arc(x, y - 10, 25, Math.PI, 0); ctx.lineTo(x + 25, y + 46); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.bone;
      ctx.beginPath(); ctx.arc(x + 8, y - 14, 8, 0, 7); ctx.fill();
      ctx.fillStyle = "#1b1d3d";
      ctx.beginPath(); ctx.arc(x + 4, y - 17, 7, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(239,227,204,0.7)";
      ctx.fillRect(x - 14, y + 10, 2, 2); ctx.fillRect(x - 6, y - 24, 2, 2); ctx.fillRect(x + 14, y + 22, 2, 2);
      ctx.strokeStyle = "#14101c"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y - 35); ctx.lineTo(x, y + 46); ctx.moveTo(x - 25, y + 10); ctx.lineTo(x + 25, y + 10); ctx.stroke();
      // moonlight falling into the room
      ctx.fillStyle = "rgba(201,184,255,0.05)";
      ctx.beginPath(); ctx.moveTo(x - 25, y + 46); ctx.lineTo(x + 25, y + 46); ctx.lineTo(x + 70, y + 180); ctx.lineTo(x - 10, y + 180); ctx.closePath(); ctx.fill();
    },
    barred: function (x, y) {
      ctx.fillStyle = "#0d0a12";
      rr(x - 22, y - 18, 44, 36, 4); ctx.fill();
      ctx.fillStyle = "#1c2140";
      ctx.fillRect(x - 17, y - 13, 34, 26);
      ctx.fillStyle = "rgba(239,227,204,0.6)";
      ctx.fillRect(x + 6, y - 8, 2, 2);
      ctx.fillStyle = "#3a3346";
      for (var i = -12; i <= 12; i += 8) ctx.fillRect(x + i - 1.5, y - 13, 3, 26);
    },
    chains: function (x, y, time, seed) {
      ctx.strokeStyle = "#4a4358"; ctx.lineWidth = 2.5;
      for (var c = -1; c <= 1; c += 2) {
        var sw = Math.sin(time / 1200 + seed + c) * 3;
        for (var i = 0; i < 9; i++) {
          ctx.beginPath();
          ctx.ellipse(x + c * 12 + sw * i / 9, y - 50 + i * 11, i % 2 ? 2 : 4, 6, 0, 0, 7);
          ctx.stroke();
        }
      }
      ctx.beginPath(); ctx.arc(x - 12, y + 52, 7, 0, Math.PI); ctx.stroke();
    },
    skulls: function (x, y) {
      ctx.fillStyle = "#1d1822";
      ctx.fillRect(x - 34, y + 14, 68, 6);
      [[-16, 0], [0, -4], [16, 0]].forEach(function (s, i) {
        var sx = x + s[0], sy = y + s[1];
        ctx.fillStyle = "#cfc4ae";
        ctx.beginPath(); ctx.arc(sx, sy + 2, 9, 0, 7); ctx.fill();
        ctx.fillRect(sx - 5, sy + 7, 10, 7);
        ctx.fillStyle = "#1a1420";
        ctx.beginPath(); ctx.arc(sx - 3.5, sy + 2, 2.6, 0, 7); ctx.arc(sx + 3.5, sy + 2, 2.6, 0, 7); ctx.fill();
        if (i === 1) { ctx.fillStyle = "#ff8fb0"; ctx.beginPath(); ctx.arc(sx - 6, sy + 7, 1.5, 0, 7); ctx.arc(sx + 6, sy + 7, 1.5, 0, 7); ctx.fill(); }
      });
    },
    cobweb: function (x, y, time, seed) {
      var cx = x < W / 2 ? 0 : W, dir = x < W / 2 ? 1 : -1;
      ctx.strokeStyle = "rgba(201,190,220,0.28)"; ctx.lineWidth = 1;
      for (var a = 0; a <= 4; a++) {
        var ang = (a / 4) * Math.PI / 2;
        ctx.beginPath(); ctx.moveTo(cx, y - 40); ctx.lineTo(cx + dir * Math.cos(ang) * 70, y - 40 + Math.sin(ang) * 70); ctx.stroke();
      }
      for (var r = 18; r <= 66; r += 16) {
        ctx.beginPath();
        for (var b = 0; b <= 4; b++) {
          var an = (b / 4) * Math.PI / 2, rr2 = r - (b % 2 ? 4 : 0);
          var px2 = cx + dir * Math.cos(an) * rr2, py2 = y - 40 + Math.sin(an) * rr2;
          b ? ctx.lineTo(px2, py2) : ctx.moveTo(px2, py2);
        }
        ctx.stroke();
      }
      // a tiny resident
      var sy = y - 10 + Math.sin(time / 800 + seed) * 6;
      ctx.beginPath(); ctx.moveTo(cx + dir * 34, y - 40); ctx.lineTo(cx + dir * 34, sy); ctx.stroke();
      ctx.fillStyle = "#16111d"; ctx.beginPath(); ctx.arc(cx + dir * 34, sy + 3, 4, 0, 7); ctx.fill();
      ctx.fillStyle = C.candle; ctx.fillRect(cx + dir * 34 - 2, sy + 2, 1.5, 1.5); ctx.fillRect(cx + dir * 34 + 1, sy + 2, 1.5, 1.5);
    },
    portrait: function (x, y, time, seed) {
      ctx.fillStyle = "#6e5326";
      rr(x - 30, y - 38, 60, 76, 4); ctx.fill();
      ctx.fillStyle = "#4b3819";
      rr(x - 25, y - 33, 50, 66, 3); ctx.fill();
      ctx.fillStyle = "#231a2e";
      ctx.fillRect(x - 21, y - 29, 42, 58);
      // the sitter: a round little creature whose eyes follow the Frog
      var hue = ["#7d6aa6", "#6a8f6a", "#a66a7d"][seed % 3];
      ctx.fillStyle = hue;
      ctx.beginPath(); ctx.arc(x, y + 6, 15, 0, 7); ctx.fill();
      ctx.fillRect(x - 15, y + 6, 30, 23);
      var fx = frog ? frog.x + FROG / 2 : W / 2, fy = frog ? frog.y : H / 2;
      var dx = fx - x, dy = fy - y, dl = Math.sqrt(dx * dx + dy * dy) || 1;
      ctx.fillStyle = C.bone;
      ctx.beginPath(); ctx.arc(x - 6, y + 2, 5, 0, 7); ctx.arc(x + 6, y + 2, 5, 0, 7); ctx.fill();
      ctx.fillStyle = "#120d18";
      ctx.beginPath(); ctx.arc(x - 6 + dx / dl * 2.4, y + 2 + dy / dl * 2.4, 2.2, 0, 7); ctx.arc(x + 6 + dx / dl * 2.4, y + 2 + dy / dl * 2.4, 2.2, 0, 7); ctx.fill();
      ctx.fillStyle = C.bone;
      ctx.beginPath(); ctx.moveTo(x - 3, y + 11); ctx.lineTo(x - 1, y + 15); ctx.lineTo(x + 1, y + 11); ctx.fill();
    },
    banner: function (x, y, time, seed) {
      var sw = Math.sin(time / 1500 + seed) * 2;
      ctx.fillStyle = "#1d1822"; ctx.fillRect(x - 26, y - 46, 52, 5);
      ctx.fillStyle = "#5a1f33";
      ctx.beginPath(); ctx.moveTo(x - 20, y - 42); ctx.lineTo(x + 20, y - 42); ctx.lineTo(x + 20 + sw, y + 46); ctx.lineTo(x + sw, y + 32); ctx.lineTo(x - 20 + sw, y + 46); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#a07a3a"; ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 16, y - 38, 32, 64);
      // frog crest
      ctx.fillStyle = C.frog;
      ctx.beginPath(); ctx.arc(x + sw / 2, y - 4, 10, 0, 7); ctx.fill();
      ctx.fillStyle = C.bone;
      ctx.beginPath(); ctx.arc(x - 4 + sw / 2, y - 12, 3.6, 0, 7); ctx.arc(x + 4 + sw / 2, y - 12, 3.6, 0, 7); ctx.fill();
      ctx.fillStyle = "#120d18";
      ctx.beginPath(); ctx.arc(x - 4 + sw / 2, y - 12, 1.6, 0, 7); ctx.arc(x + 4 + sw / 2, y - 12, 1.6, 0, 7); ctx.fill();
    },
    shelf: function (x, y, time, seed) {
      ctx.fillStyle = "#3a2618"; ctx.fillRect(x - 46, y - 52, 92, 108);
      ctx.fillStyle = "#24170e";
      for (var r = 0; r < 3; r++) {
        ctx.fillRect(x - 40, y - 46 + r * 34, 80, 28);
        var bx = x - 38;
        for (var b = 0; bx < x + 36; b++) {
          var bw = 6 + rnd(seed * 3 + r, b) * 6, bh = 18 + rnd(seed + r, b + 9) * 8;
          ctx.fillStyle = ["#5a1f33", "#2f4a3a", "#3c3566", "#6e5326", "#4a2a4a"][Math.floor(rnd(seed + b, r) * 5)];
          ctx.fillRect(bx, y - 46 + r * 34 + 28 - bh, Math.min(bw, x + 38 - bx), bh);
          bx += bw + 1;
        }
      }
      // one book has eyes
      var ey = y - 46 + 34 + 14;
      ctx.fillStyle = C.candle;
      if (Math.sin(time / 600 + seed) > -0.9) { ctx.fillRect(x + 4, ey, 2, 2); ctx.fillRect(x + 9, ey, 2, 2); }
    },
    candles: function (x, y, time, seed) {
      ctx.fillStyle = "#1d1822"; ctx.fillRect(x - 24, y + 18, 48, 5);
      [[-14, 22], [0, 32], [14, 18]].forEach(function (c, i) {
        ctx.fillStyle = "#e8dcc4";
        ctx.fillRect(x + c[0] - 4, y + 18 - c[1], 8, c[1]);
        ctx.fillStyle = "#d8ccb4"; ctx.beginPath(); ctx.arc(x + c[0] + 3, y + 22 - c[1], 2, 0, 7); ctx.fill();
        flame(x + c[0], y + 18 - c[1], 0.8, time, seed + i);
      });
      glow(x, y - 10, 60, 0.18);
    },
    bell: function (x, y, time, seed) {
      var a = Math.sin(time / 900 + seed) * 0.12;
      ctx.strokeStyle = "#3a2c22"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y - 60); ctx.lineTo(x, y - 26); ctx.stroke();
      ctx.save(); ctx.translate(x, y - 26); ctx.rotate(a);
      ctx.fillStyle = "#8a6a34";
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-14, 6, -16, 30); ctx.lineTo(-22, 40); ctx.lineTo(22, 40); ctx.lineTo(16, 30); ctx.quadraticCurveTo(14, 6, 6, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#5e4622"; ctx.fillRect(-22, 36, 44, 4);
      ctx.fillStyle = "#1a1420";
      ctx.beginPath(); ctx.arc(-6, 22, 2, 0, 7); ctx.arc(6, 22, 2, 0, 7); ctx.fill();
      ctx.fillStyle = "#3a2c22"; ctx.beginPath(); ctx.arc(0, 44, 4, 0, 7); ctx.fill();
      ctx.restore();
    },
    rope: function (x, y, time, seed) {
      ctx.strokeStyle = "#6b5236"; ctx.lineWidth = 3;
      var sw = Math.sin(time / 1100 + seed) * 6;
      ctx.beginPath(); ctx.moveTo(x, y - 90); ctx.quadraticCurveTo(x + sw, y, x + sw * 0.6, y + 70); ctx.stroke();
      ctx.fillStyle = "#6b5236"; ctx.beginPath(); ctx.ellipse(x + sw * 0.6, y + 74, 5, 8, 0, 0, 7); ctx.fill();
    }
  };

  function drawDivider(y, fl, time) {
    if (fl.sky) {
      // distant turrets with a few lit windows
      [[40, 120, 34], [150, 70, 26], [300, 150, 40], [372, 90, 24]].forEach(function (t, i) {
        var tx = t[0], th = t[1], tw = t[2];
        ctx.fillStyle = "#171226";
        ctx.fillRect(tx - tw / 2, y - 6 - th, tw, th);
        ctx.beginPath(); ctx.moveTo(tx - tw / 2 - 5, y - 6 - th); ctx.lineTo(tx, y - 6 - th - tw * 1.3); ctx.lineTo(tx + tw / 2 + 5, y - 6 - th); ctx.fill();
        var lit = 0.55 + 0.45 * Math.sin(time / 700 + i * 2);
        ctx.fillStyle = "rgba(242,178,76," + lit.toFixed(2) + ")";
        rr(tx - 3, y - th + 14, 6, 10, 3); ctx.fill();
        if (i % 2 === 0) { rr(tx - 3, y - th + 40, 6, 10, 3); ctx.fill(); }
      });
      // castle parapet: the last wall before the open sky
      ctx.fillStyle = "#2a2236";
      ctx.fillRect(0, y - 6, W, 30);
      for (var x = 0; x < W; x += 40) ctx.fillRect(x, y - 26, 24, 22);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(0, y - 6, W, 2);
    } else {
      ctx.fillStyle = "#18121f";
      ctx.fillRect(0, y - 16, W, 32);
      ctx.fillStyle = "#3a2f48";
      ctx.fillRect(0, y - 16, W, 4);
      ctx.fillRect(0, y + 12, W, 3);
      for (var d = 6; d < W; d += 22) ctx.fillRect(d, y + 4, 10, 6);
    }
    ctx.fillStyle = "rgba(169,156,196,0.75)";
    ctx.font = '19px "Pirata One", Georgia, serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var label = fl.name;
    var w = ctx.measureText(label).width + 26;
    ctx.fillStyle = fl.sky ? "#2a2236" : "#18121f";
    ctx.fillRect(W / 2 - w / 2, y - 13, w, 24);
    ctx.fillStyle = "rgba(201,184,255,0.85)";
    ctx.fillText(label, W / 2, y - 1);
    ctx.textAlign = "left";
  }

  // ---- drawing: platforms and pickups ----
  function drawPlat(p, x, y, time) {
    var img = IMG[p.kind];
    if (p.kind === "ectoplasm") ctx.globalAlpha = Math.max(0, p.fade);
    if (img) {
      ctx.drawImage(img, x, y - 4, PW, PH + 8);
    } else if (p.kind === "ledge") {
      ctx.fillStyle = C.stoneDark;
      ctx.beginPath(); ctx.moveTo(x + 10, y + 10); ctx.lineTo(x + 22, y + 10); ctx.lineTo(x + 16, y + 20); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + PW - 22, y + 10); ctx.lineTo(x + PW - 10, y + 10); ctx.lineTo(x + PW - 16, y + 20); ctx.fill();
      ctx.fillStyle = C.stone;
      rr(x, y, PW, 11, 3); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(x + 3, y + 1, PW - 6, 2);
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(x + 26, y + 2, 1.5, 8); ctx.fillRect(x + 52, y + 2, 1.5, 8);
    } else if (p.kind === "ghostboard") {
      ctx.shadowColor = "#c9b8ff"; ctx.shadowBlur = 14;
      ctx.fillStyle = "rgba(201,184,255,0.9)";
      rr(x, y, PW, 9, 5); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(236,230,255,0.9)";
      ctx.beginPath(); ctx.arc(x + 15, y + 13, 4, 0, 7); ctx.arc(x + PW - 15, y + 13, 4, 0, 7); ctx.fill();
      // wisps trailing behind
      var dir = p.vx > 0 ? -1 : 1;
      ctx.fillStyle = "rgba(201,184,255,0.25)";
      for (var w = 1; w <= 3; w++) { ctx.beginPath(); ctx.arc(x + PW / 2 + dir * (PW / 2 + w * 7), y + 5 + Math.sin(time / 150 + w) * 2, 4 - w, 0, 7); ctx.fill(); }
    } else if (p.kind === "chandelier") {
      ctx.strokeStyle = "#4a4358"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x + PW / 2, y - 60); ctx.lineTo(x + PW - 8, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + PW / 2, y - 60); ctx.lineTo(x + PW / 2, y - 140); ctx.stroke();
      ctx.fillStyle = C.iron;
      rr(x, y, PW, 8, 3); ctx.fill();
      ctx.beginPath(); ctx.arc(x + PW / 2, y + 12, 6, 0, Math.PI); ctx.fill();
      ctx.fillStyle = "#e8dcc4";
      ctx.fillRect(x + 2, y - 10, 6, 10); ctx.fillRect(x + PW - 8, y - 10, 6, 10);
      flame(x + 5, y - 10, 0.6, time, p.t); flame(x + PW - 5, y - 10, 0.6, time, p.t + 2);
      glow(x + PW / 2, y - 6, 54, 0.12);
    } else if (p.kind === "ectoplasm") {
      ctx.shadowColor = C.ecto; ctx.shadowBlur = 10;
      ctx.fillStyle = "rgba(159,242,214,0.55)";
      rr(x, y, PW, 10, 5); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(159,242,214,0.55)";
      for (var dpp = 0; dpp < 3; dpp++) { var dx = x + 14 + dpp * 24, dl = 4 + Math.sin(time / 300 + dpp + p.t) * 3; ctx.fillRect(dx, y + 9, 3, dl); ctx.beginPath(); ctx.arc(dx + 1.5, y + 9 + dl, 2.2, 0, 7); ctx.fill(); }
    } else if (p.kind === "rotten") {
      var halves = p.broken ? [[x - p.fall * 0.02, -p.fall * 0.0006], [x + PW / 2 + p.fall * 0.02, p.fall * 0.0006]] : [[x, 0], [x + PW / 2, 0]];
      halves.forEach(function (hh, i) {
        ctx.save();
        ctx.translate(hh[0] + PW / 4, y + 5);
        ctx.rotate(hh[1] * 60);
        ctx.fillStyle = C.wood;
        ctx.beginPath();
        if (i === 0) { ctx.moveTo(-PW / 4, -5); ctx.lineTo(PW / 4, -5); ctx.lineTo(PW / 4 - 4, 0); ctx.lineTo(PW / 4 + 1, 5); ctx.lineTo(-PW / 4, 5); }
        else { ctx.moveTo(-PW / 4, -5); ctx.lineTo(PW / 4, -5); ctx.lineTo(PW / 4, 5); ctx.lineTo(-PW / 4 + 1, 5); ctx.lineTo(-PW / 4 - 4, 0); }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = C.woodDark;
        ctx.fillRect(-PW / 4 + 4, -1, PW / 2 - 10, 1.5);
        ctx.fillStyle = "#9a9aa8"; ctx.fillRect(i ? PW / 4 - 6 : -PW / 4 + 4, -3, 2, 2);
        ctx.restore();
      });
    } else if (p.kind === "crate") {
      var lit = p.fuse > 0, hot = lit && p.fuse < 1 && Math.sin(time / 50) > 0;
      ctx.fillStyle = hot ? C.blood : C.wood;
      rr(x, y, PW, 12, 2); ctx.fill();
      ctx.fillStyle = C.woodDark;
      ctx.fillRect(x + 2, y + 5, PW - 4, 2);
      // skull stamp
      ctx.fillStyle = hot ? C.bone : "#cdbb98";
      ctx.beginPath(); ctx.arc(x + PW / 2, y + 5, 4, 0, 7); ctx.fill();
      ctx.fillStyle = hot ? C.blood : C.wood;
      ctx.fillRect(x + PW / 2 - 2.5, y + 4, 1.8, 1.8); ctx.fillRect(x + PW / 2 + 0.7, y + 4, 1.8, 1.8);
      // fuse
      ctx.strokeStyle = "#2a1f18"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x + PW - 10, y); ctx.quadraticCurveTo(x + PW - 4, y - 8, x + PW + 2, y - 6); ctx.stroke();
      if (lit) {
        ctx.fillStyle = Math.random() < 0.5 ? C.candle : "#ffe08a";
        ctx.beginPath(); ctx.arc(x + PW + 2, y - 6, 2 + Math.random() * 2, 0, 7); ctx.fill();
        glow(x + PW / 2, y + 4, 40, hot ? 0.35 : 0.18);
      }
    }
    ctx.globalAlpha = 1;
    if (p.spring) drawMushroom(x + PW / 2, y, p.springT > 0);
    if (p.item) drawItem(p.item, x + PW / 2, y, time);
  }

  function drawMushroom(x, y, squashed) {
    if (IMG.mushroom) { ctx.drawImage(IMG.mushroom, x - 10, y - 20, 20, 20); return; }
    var s = squashed ? 0.6 : 1;
    ctx.fillStyle = C.bone;
    rr(x - 4, y - 9 * s, 8, 9 * s, 2); ctx.fill();
    ctx.fillStyle = C.blood;
    ctx.beginPath(); ctx.ellipse(x, y - 9 * s, 11, 7 * s, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = C.bone;
    ctx.beginPath(); ctx.arc(x - 4, y - 12 * s, 1.6, 0, 7); ctx.arc(x + 4, y - 13 * s, 1.3, 0, 7); ctx.fill();
  }

  function drawItem(kind, x, y, time) {
    var bob = Math.sin(time / 300) * 2;
    var iy = y - 18 + bob;
    if (IMG[kind]) { var im = IMG[kind]; ctx.drawImage(im, x - im.width / 4, iy - im.height / 4, im.width / 2, im.height / 2); return; }
    glow(x, iy, 30, 0.2);
    if (kind === "wings") drawWings(x, iy, time, 0.8);
    else if (kind === "ciruela") drawCiruela(x, iy + 4, time, 0.55);
    else if (kind === "lantern") drawLantern(x, iy, time);
  }

  function drawWings(x, y, time, s) {
    var flap = Math.sin(time / 70) * 0.35;
    ctx.fillStyle = "#3d2d55";
    for (var side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(side * s, s);
      ctx.rotate(flap);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.quadraticCurveTo(14, -16, 30, -10);
      ctx.lineTo(26, -2); ctx.lineTo(22, 4); ctx.lineTo(16, 0); ctx.lineTo(10, 6); ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function drawCiruela(x, y, time, s) {
    // Ciruela, the fluffy plum-colored cat who carries the Frog
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    var tail = Math.sin(time / 180) * 0.4;
    ctx.strokeStyle = C.plum; ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-46, -6 + tail * 10, -42, -22); ctx.stroke();
    ctx.lineCap = "butt";
    ctx.fillStyle = C.plum;
    ctx.beginPath(); ctx.ellipse(0, 0, 34, 15, 0, 0, 7); ctx.fill();
    for (var b = -24; b <= 24; b += 12) { ctx.beginPath(); ctx.arc(b, 12, 6, 0, 7); ctx.fill(); }
    ctx.beginPath(); ctx.arc(26, -8, 13, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(17, -16); ctx.lineTo(20, -30); ctx.lineTo(27, -19); ctx.fill();
    ctx.beginPath(); ctx.moveTo(29, -19); ctx.lineTo(36, -30); ctx.lineTo(37, -14); ctx.fill();
    ctx.strokeStyle = "#1a1420"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(23, -8, 2.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(32, -8, 2.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.fillStyle = "#ff9fbe"; ctx.beginPath(); ctx.arc(28, -3, 1.6, 0, 7); ctx.fill();
    ctx.restore();
  }

  function drawLantern(x, y, time) {
    ctx.strokeStyle = "#4a4358"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y - 12, 5, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = "#d8ccb4";
    ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill();
    ctx.fillRect(x - 6, y + 5, 12, 7);
    var f = 0.6 + 0.4 * Math.sin(time / 80);
    ctx.fillStyle = "rgba(242,178,76," + f.toFixed(2) + ")";
    ctx.beginPath(); ctx.arc(x - 3.5, y, 2.8, 0, 7); ctx.arc(x + 3.5, y, 2.8, 0, 7); ctx.fill();
    glow(x, y, 28, 0.25);
  }

  function drawFly(f, x, y, time) {
    if (IMG.fly) { ctx.drawImage(IMG.fly, x - 6, y - 6, 12, 12); return; }
    var buzz = Math.sin(time / 25 + f.t * 10) * 3;
    ctx.fillStyle = "rgba(220,230,255,0.55)";
    ctx.beginPath(); ctx.ellipse(x - 3, y - 4, 3, 4 + buzz * 0.3, -0.4, 0, 7); ctx.ellipse(x + 3, y - 4, 3, 4 - buzz * 0.3, 0.4, 0, 7); ctx.fill();
    ctx.fillStyle = "#15111b";
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, 7); ctx.fill();
    ctx.fillStyle = "#d9485f"; ctx.fillRect(x - 2, y - 2, 1.5, 1.5); ctx.fillRect(x + 0.8, y - 2, 1.5, 1.5);
  }

  // ---- drawing: monsters ----
  function drawMonster(m, x, y, time) {
    var img = IMG[m.kind];
    if (m.kind === "maw") { drawMaw(m, x, y, time); return; }
    if (img) {
      if (m.kind === "spider") { ctx.strokeStyle = "rgba(220,220,235,0.5)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + m.w / 2, m.anchor - 400); ctx.lineTo(x + m.w / 2, y + 4); ctx.stroke(); }
      ctx.save();
      if (m.vx < 0) { ctx.translate(x + m.w, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, m.w, m.h); }
      else ctx.drawImage(img, x, y, m.w, m.h);
      ctx.restore();
      return;
    }
    var cx = x + m.w / 2;
    if (m.kind === "ghost") {
      ctx.shadowColor = "#c9b8ff"; ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(236,230,255,0.92)";
      ctx.beginPath();
      ctx.arc(cx, y + 20, 20, Math.PI, 0);
      ctx.lineTo(cx + 20, y + 40);
      for (var b = 0; b < 4; b++) {
        var bx = cx + 20 - (b + 1) * 10, wob = Math.sin(time / 120 + b) * 3;
        ctx.quadraticCurveTo(bx + 5, y + 48 + wob, bx, y + 40);
      }
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      var dir = m.vx > 0 ? 2 : -2;
      ctx.fillStyle = "#1a1420";
      ctx.beginPath(); ctx.ellipse(cx - 7 + dir, y + 18, 3.5, 5, 0, 0, 7); ctx.ellipse(cx + 7 + dir, y + 18, 3.5, 5, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + dir, y + 29, 3, 3.6 + Math.sin(time / 200) * 1.2, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,143,176,0.6)";
      ctx.beginPath(); ctx.arc(cx - 13 + dir, y + 25, 3, 0, 7); ctx.arc(cx + 13 + dir, y + 25, 3, 0, 7); ctx.fill();
    } else if (m.kind === "bat") {
      var flap = Math.sin(time / 60 + m.t) ;
      var cy = y + m.h / 2;
      ctx.fillStyle = "#3d2d55";
      for (var s2 = -1; s2 <= 1; s2 += 2) {
        ctx.beginPath();
        ctx.moveTo(cx + s2 * 6, cy);
        ctx.quadraticCurveTo(cx + s2 * 16, cy - 14 * flap, cx + s2 * 22, cy - 4 * flap);
        ctx.lineTo(cx + s2 * 17, cy + 2); ctx.lineTo(cx + s2 * 13, cy + 6 - 3 * flap); ctx.lineTo(cx + s2 * 8, cy + 6);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = "#5a4478";
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 8, cy - 5); ctx.lineTo(cx - 6, cy - 15); ctx.lineTo(cx - 2, cy - 8); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 8, cy - 5); ctx.lineTo(cx + 6, cy - 15); ctx.lineTo(cx + 2, cy - 8); ctx.fill();
      ctx.fillStyle = C.candle;
      ctx.beginPath(); ctx.arc(cx - 4, cy - 1, 2.6, 0, 7); ctx.arc(cx + 4, cy - 1, 2.6, 0, 7); ctx.fill();
      ctx.fillStyle = "#1a1420";
      ctx.beginPath(); ctx.arc(cx - 4, cy - 1, 1.1, 0, 7); ctx.arc(cx + 4, cy - 1, 1.1, 0, 7); ctx.fill();
      ctx.fillStyle = C.bone;
      ctx.beginPath(); ctx.moveTo(cx - 3, cy + 4); ctx.lineTo(cx - 2, cy + 7.5); ctx.lineTo(cx - 1, cy + 4); ctx.moveTo(cx + 1, cy + 4); ctx.lineTo(cx + 2, cy + 7.5); ctx.lineTo(cx + 3, cy + 4); ctx.fill();
    } else if (m.kind === "spider") {
      var sy = y + m.h / 2;
      ctx.strokeStyle = "rgba(220,220,235,0.45)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, Math.min(m.anchor, y) - 400); ctx.lineTo(cx, y + 4); ctx.stroke();
      ctx.strokeStyle = "#241d2e"; ctx.lineWidth = 2.5;
      for (var l = 0; l < 4; l++) {
        var wig = Math.sin(time / 140 + l) * 3;
        for (var sd = -1; sd <= 1; sd += 2) {
          ctx.beginPath();
          ctx.moveTo(cx + sd * 8, sy - 2 + l * 3);
          ctx.quadraticCurveTo(cx + sd * 20, sy - 12 + l * 6 + wig, cx + sd * 22, sy + 4 + l * 5);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "#2b2236";
      ctx.beginPath(); ctx.arc(cx, sy + 2, 13, 0, 7); ctx.fill();
      ctx.fillStyle = C.bone;
      ctx.beginPath(); ctx.arc(cx - 5, sy, 4.5, 0, 7); ctx.arc(cx + 5, sy, 4.5, 0, 7); ctx.fill();
      ctx.fillStyle = "#1a1420";
      var look = frog ? clamp((frog.y - y) / 200, -1.5, 1.5) : 0;
      ctx.beginPath(); ctx.arc(cx - 5, sy + look, 2, 0, 7); ctx.arc(cx + 5, sy + look, 2, 0, 7); ctx.fill();
      ctx.fillStyle = C.blood;
      ctx.beginPath(); ctx.arc(cx - 2.5, sy + 8, 1.4, 0, 7); ctx.arc(cx + 2.5, sy + 8, 1.4, 0, 7); ctx.fill();
    }
  }

  function drawMaw(m, x, y, time) {
    var cx = x + m.w / 2, cy = y + m.h / 2;
    // pull rings
    ctx.strokeStyle = "rgba(201,184,255,0.18)"; ctx.lineWidth = 1.5;
    for (var r = 0; r < 3; r++) {
      var rad = 120 - ((time / 12 + r * 40) % 120);
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(30, rad), 0, 7); ctx.stroke();
    }
    if (IMG.maw) { ctx.drawImage(IMG.maw, x, y, m.w, m.h); return; }
    var g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 32);
    g.addColorStop(0, "#000"); g.addColorStop(0.7, "#120a1e"); g.addColorStop(1, "#4b2a6a");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, 32, 0, 7); ctx.fill();
    // a ring of little teeth, slowly turning
    ctx.fillStyle = C.bone;
    var rot = time / 1600;
    for (var t = 0; t < 14; t++) {
      var a = rot + t / 14 * Math.PI * 2;
      var ox = cx + Math.cos(a) * 29, oy = cy + Math.sin(a) * 29;
      ctx.beginPath();
      ctx.moveTo(ox + Math.cos(a + 1.57) * 3.5, oy + Math.sin(a + 1.57) * 3.5);
      ctx.lineTo(ox - Math.cos(a + 1.57) * 3.5, oy - Math.sin(a + 1.57) * 3.5);
      ctx.lineTo(cx + Math.cos(a) * 21, cy + Math.sin(a) * 21);
      ctx.closePath(); ctx.fill();
    }
    // sleepy eyes above it
    var open = Math.sin(time / 1400) > -0.8;
    ctx.fillStyle = "#c9b8ff";
    if (open) { ctx.beginPath(); ctx.arc(cx - 12, cy - 42, 4, 0, 7); ctx.arc(cx + 12, cy - 42, 4, 0, 7); ctx.fill(); }
    else { ctx.fillRect(cx - 16, cy - 42, 8, 1.6); ctx.fillRect(cx + 8, cy - 42, 8, 1.6); }
  }

  // ---- drawing: the Frog ----
  function drawFrogAt(x, y, time) {
    var s = FROG;
    var up = Math.max(0, Math.min(-frog.vy / F.jump, 1));
    var stretch = frog.power ? 0.05 : up * 0.12;
    var sq = frog.squash * 0.2;
    var lean = (frog.vx / F.maxRun) * 0.12;
    var scale = 1;
    if (frog.dead === "maw") scale = Math.max(0, 1 - frog.deadT / 0.8);

    if (frog.power === "ciruela") drawCiruela(x + s / 2, y + s + 10, time, 0.9);
    if (frog.power === "wings") drawWings(x + s / 2, y + s / 2, time, 1);

    ctx.save();
    ctx.translate(x + s / 2, y + s);
    ctx.rotate(lean + (frog.dead ? frog.spin : 0));
    ctx.scale(frog.look * (1 + sq - stretch) * scale, (1 - sq + stretch) * scale);
    if (IMG.frog) {
      ctx.drawImage(IMG.frog, -s / 2, -s, s, s);
    } else {
      ctx.fillStyle = C.frogDark;
      var leg = frog.vy < 0 ? 10 : 5;
      if (frog.power === "ciruela") leg = 4;
      rr(-s / 2 + 2, -8, 12, leg, 4); ctx.fill();
      rr(s / 2 - 14, -8, 12, leg, 4); ctx.fill();
      ctx.fillStyle = C.frog;
      rr(-s / 2, -s + 8, s, s - 10, 12); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      rr(-s / 2 + 6, -s + 12, 10, 6, 3); ctx.fill();
      ctx.fillStyle = C.bone;
      ctx.beginPath(); ctx.arc(-8, -s + 9, 7, 0, 7); ctx.arc(9, -s + 9, 7, 0, 7); ctx.fill();
      ctx.fillStyle = C.night;
      if (frog.dead) {
        ctx.strokeStyle = C.night; ctx.lineWidth = 2;
        [-8, 9].forEach(function (ex) {
          ctx.beginPath(); ctx.moveTo(ex - 3, -s + 6); ctx.lineTo(ex + 3, -s + 12); ctx.moveTo(ex + 3, -s + 6); ctx.lineTo(ex - 3, -s + 12); ctx.stroke();
        });
      } else {
        var look = frog.vy > 300 ? 2 : 0;
        ctx.beginPath(); ctx.arc(-6, -s + 9 + look, 3, 0, 7); ctx.arc(11, -s + 9 + look, 3, 0, 7); ctx.fill();
      }
      // bandana
      ctx.fillStyle = C.blood;
      ctx.fillRect(-s / 2, -s + 18, s, 5);
      ctx.fillRect(-s / 2 - 7, -s + 18 + Math.sin(time / 90) * 1.5, 9, 3);
    }
    ctx.restore();

    if (frog.tongue >= 0) {
      var b = tongueBase(), len = tongueLen();
      var bx = b.x - frog.x + x, by = b.y - frog.y + y;
      ctx.strokeStyle = C.tongue; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - len); ctx.stroke();
      ctx.lineCap = "butt";
      ctx.fillStyle = "#ff9fbe";
      ctx.beginPath(); ctx.arc(bx, by - len, 5, 0, 7); ctx.fill();
    }

    if (frog.shield > 0 && !frog.dead) {
      var blink = frog.shield < 2 ? (Math.sin(time / 60) > 0 ? 1 : 0.3) : 1;
      ctx.strokeStyle = "rgba(242,178,76," + (0.7 * blink).toFixed(2) + ")";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, 30 + Math.sin(time / 200) * 2, 0, 7); ctx.stroke();
      glow(x + s / 2, y + s / 2, 42, 0.12 * blink);
    }
  }

  function draw(alpha, time) {
    time = time === undefined ? performance.now() - t0 : time;
    var cam = lerp(prevCam, camY, alpha);
    ctx.save();
    if (shake > 0 && !reduceMotion) ctx.translate((Math.random() - 0.5) * 8 * shake, (Math.random() - 0.5) * 8 * shake);
    drawBackground(cam, time);
    if (plats) {
      var i;
      for (i = 0; i < plats.length; i++) { var p = plats[i]; drawPlat(p, lerp(p.px, p.x, alpha), lerp(p.py, p.y, alpha), time); }
      for (i = 0; i < flies.length; i++) { var f = flies[i]; drawFly(f, lerp(f.px, f.x, alpha), lerp(f.py, f.y, alpha), time); }
      for (i = 0; i < mons.length; i++) { var m = mons[i]; drawMonster(m, lerp(m.px, m.x, alpha), lerp(m.py, m.y, alpha), time); }
      for (i = 0; i < parts.length; i++) {
        var q = parts[i];
        ctx.globalAlpha = Math.max(0, q.life / q.max);
        ctx.fillStyle = q.color;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      var fx = lerp(frog.px, frog.x, alpha), fy = lerp(frog.py, frog.y, alpha);
      drawFrogAt(fx, fy, time);
      if (fx + FROG > W) drawFrogAt(fx - W, fy, time);
      if (fx < 0) drawFrogAt(fx + W, fy, time);
      ctx.font = '22px "VT323", monospace';
      ctx.textAlign = "center";
      for (i = 0; i < texts.length; i++) {
        ctx.globalAlpha = Math.max(0, texts[i].life);
        ctx.fillStyle = texts[i].color;
        ctx.fillText(texts[i].text, texts[i].x, texts[i].y);
      }
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
    }
    ctx.restore();
    ctx.drawImage(vignette, 0, 0, W, H);
    if (state === "play") drawHud(time);
  }

  function drawHud(time) {
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = C.bone;
    ctx.font = '34px "VT323", monospace';
    ctx.fillText(String(score), W / 2, 14);
    if (frog.power || frog.shield > 0) {
      var frac = frog.power ? frog.powerT / frog.powerMax : frog.shield / F.shieldTime;
      ctx.fillStyle = "rgba(169,156,196,0.3)";
      ctx.fillRect(W / 2 - 40, 50, 80, 4);
      ctx.fillStyle = C.candle;
      ctx.fillRect(W / 2 - 40, 50, 80 * clamp(frac, 0, 1), 4);
    }
    if (banner && !frog.dead) {
      var t = banner.t, a = t < 0.4 ? t / 0.4 : t > 2.4 ? Math.max(0, (3 - t) / 0.6) : 1;
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(15,11,26,0.6)";
      ctx.fillRect(40, H * 0.2 - 8, W - 80, 66);
      ctx.fillStyle = C.mist;
      ctx.font = '18px "VT323", monospace';
      ctx.fillText("floor " + banner.num, W / 2, H * 0.2);
      ctx.fillStyle = C.bone;
      ctx.font = '34px "Pirata One", Georgia, serif';
      ctx.fillText(banner.name, W / 2, H * 0.2 + 18);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // ---- loops ----
  function loop(now) {
    var frame = Math.min((now - last) / 1000, 0.1);
    last = now;
    acc += frame;
    while (acc >= STEP && state === "play") { step(STEP); acc -= STEP; }
    draw(state === "play" ? acc / STEP : 1, now - t0);
    if (state === "play") raf = requestAnimationFrame(loop);
  }

  function idle(now) {
    if (state === "play" || intro.hidden) return;
    draw(1, now - t0);
    if (!reduceMotion) idleRaf = requestAnimationFrame(idle);
  }

  function show(name) {
    Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; });
  }

  function setPlayingUi(on) {
    hint.hidden = !on;
    if (tongueBtn) tongueBtn.hidden = !(on && coarse);
    if (on) hint.textContent = coarse ? (tilt !== null ? "tilt to steer" : "hold a side to steer") : "← → steer, space or ↑ to lick";
  }

  function start() {
    cancelAnimationFrame(idleRaf);
    askTilt();
    reset();
    state = "play";
    show(null);
    setPlayingUi(true);
    canvas.focus();
    last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function gameOver(cause) {
    if (state !== "play") return;
    state = "over";
    cancelAnimationFrame(raf);
    if (score > best) {
      best = score;
      try { localStorage.setItem("cd-frog-best", String(best)); } catch (e) {}
    }
    scoreOut.textContent = score;
    bestOut.forEach(function (el) { el.textContent = best; });
    if (causeOut) causeOut.textContent = CAUSES[cause] || CAUSES.fell;
    if (floorOut) floorOut.textContent = FLOORS[floorIdx].name;
    setPlayingUi(false);
    show("over");
    idleRaf = requestAnimationFrame(idle);
    var again = screens.over.querySelector('[data-action="play"]');
    if (again) again.focus();
  }

  // ---- open / close the intro ----
  function enterSite() {
    state = "title";
    cancelAnimationFrame(raf);
    cancelAnimationFrame(idleRaf);
    input = 0;
    setPlayingUi(false);
    intro.classList.add("leaving");
    document.documentElement.classList.remove("intro-open");
    try { sessionStorage.setItem("cd-intro-seen", "1"); } catch (e) {}
    setTimeout(function () {
      intro.hidden = true;
      intro.classList.remove("leaving");
    }, 350);
    var main = document.querySelector("main");
    if (main) { main.setAttribute("tabindex", "-1"); main.focus({ preventScroll: true }); }
  }

  function openIntro() {
    intro.hidden = false;
    document.documentElement.classList.add("intro-open");
    state = "title";
    reset();
    frog.vy = 0;
    show("title");
    setPlayingUi(false);
    fit();
    cancelAnimationFrame(idleRaf);
    idleRaf = requestAnimationFrame(idle);
    var play = screens.title.querySelector('[data-action="play"]');
    if (play) play.focus();
  }

  intro.addEventListener("click", function (e) {
    var b = e.target.closest("[data-action]");
    if (!b) return;
    if (b.getAttribute("data-action") === "play") start();
    else enterSite();
  });

  document.querySelectorAll("[data-open-game]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); openIntro(); });
  });

  // ---- controls ----
  var keys = { left: false, right: false };
  var touchDir = 0;
  function syncInput() {
    var k = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (k !== 0) input = k;
    else if (touchDir !== 0) input = touchDir;
    else if (tilt !== null) input = clamp(tilt / F.tiltRange, -1, 1);
    else input = 0;
  }
  function isLeft(e) { return e.key === "ArrowLeft" || e.key === "a" || e.key === "A"; }
  function isRight(e) { return e.key === "ArrowRight" || e.key === "d" || e.key === "D"; }
  function isLick(e) { return e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W"; }
  document.addEventListener("keydown", function (e) {
    if (intro.hidden) return;
    if (e.key === "Escape") { enterSite(); return; }
    if (state !== "play") return;
    if (isLeft(e)) { keys.left = true; syncInput(); e.preventDefault(); }
    if (isRight(e)) { keys.right = true; syncInput(); e.preventDefault(); }
    if (isLick(e)) { lick(); e.preventDefault(); }
  });
  document.addEventListener("keyup", function (e) {
    if (isLeft(e)) { keys.left = false; syncInput(); }
    if (isRight(e)) { keys.right = false; syncInput(); }
  });

  // touch: hold a side to steer. mouse: click to lick.
  var pointers = {};
  function pointerSide(e) {
    var r = canvas.getBoundingClientRect();
    return e.clientX < r.left + r.width / 2 ? -1 : 1;
  }
  function syncPointers() {
    var l = false, rgt = false;
    Object.keys(pointers).forEach(function (id) { if (pointers[id] < 0) l = true; else rgt = true; });
    touchDir = (rgt ? 1 : 0) - (l ? 1 : 0);
    syncInput();
  }
  var stage = canvas.parentElement;
  stage.addEventListener("pointerdown", function (e) {
    if (state !== "play" || e.target.closest("button")) return;
    if (e.pointerType === "mouse") { lick(); return; }
    pointers[e.pointerId] = pointerSide(e);
    syncPointers();
    e.preventDefault();
  });
  stage.addEventListener("pointermove", function (e) {
    if (pointers[e.pointerId] === undefined) return;
    pointers[e.pointerId] = pointerSide(e);
    syncPointers();
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
    stage.addEventListener(ev, function (e) { delete pointers[e.pointerId]; syncPointers(); });
  });
  if (tongueBtn) {
    tongueBtn.addEventListener("pointerdown", function (e) { e.preventDefault(); e.stopPropagation(); lick(); });
    tongueBtn.addEventListener("click", function (e) { e.preventDefault(); });
  }

  // phones: tilt to steer. iPhones ask permission once, from the Play tap.
  var tiltAsked = false;
  function onTilt(e) {
    if (e.gamma === null || e.gamma === undefined) return;
    var g = e.gamma;
    var o = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    if (o === 90) g = e.beta; else if (o === -90 || o === 270) g = -e.beta;
    var first = tilt === null;
    tilt = Math.abs(g) < 3 ? 0 : g;
    if (state === "play") { if (first) setPlayingUi(true); syncInput(); }
  }
  function askTilt() {
    if (tiltAsked || !("ontouchstart" in window) || !window.DeviceOrientationEvent) return;
    tiltAsked = true;
    var D = window.DeviceOrientationEvent;
    if (typeof D.requestPermission === "function") {
      D.requestPermission().then(function (r) {
        if (r === "granted") window.addEventListener("deviceorientation", onTilt);
      }).catch(function () {});
    } else {
      window.addEventListener("deviceorientation", onTilt);
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { keys.left = keys.right = false; pointers = {}; touchDir = 0; syncInput(); }
    if (!document.hidden && state === "play") { last = performance.now(); acc = 0; }
  });

  // ---- on hold: Frog Jump no longer opens by itself on the first visit ----
  // The arcade TV in the castle opens it (frogJump.open()), and so does a link ending in #play.
  // To bring back the automatic intro, restore the once-per-visit check that used sessionStorage "cd-intro-seen".
  if (location.hash === "#play") openIntro();
  else intro.hidden = true;

  // console helpers for testing: frogJump.warp(3300) jumps to a floor, frogJump.god = true can't lose
  window.frogJump = {
    start: start, enter: enterSite, open: openIntro, lick: lick,
    warp: function (s) {
      camY = prevCam = s * 4;
      plats = []; mons = []; flies = [];
      var first = makePlat("ledge", H - 50, 0);
      first.x = first.px = W / 2 - PW / 2;
      plats.push(first);
      frog.x = frog.px = W / 2 - FROG / 2; frog.y = frog.py = H - 50 - FROG; frog.vy = -F.jump;
      nextY = H - 50; lastMonWU = camY - 1000; lastPowWU = camY - 2000;
      while (nextY > -60) spawnRow();
      floorIdx = floorIndexAt(s); banner = { t: 0, name: FLOORS[floorIdx].name, num: floorIdx + 1 };
    },
    spawn: function (kind, y) { spawnMonster(kind, y === undefined ? H * 0.3 : y, plats[0], 0.5); },
    set god(v) { god = !!v; }, get god() { return god; },
    get state() { return state; }, get score() { return score; }, get floor() { return FLOORS[floorIdx].name; },
    get debug() { return { frog: frog, plats: plats, mons: mons, W: W, PW: PW }; }
  };
})();
