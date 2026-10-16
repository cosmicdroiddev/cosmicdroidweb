// Fills project grids, runs the lightbox and the contact form.
(function () {
  // Pages inside /projects/ need "../" in front of asset paths.
  var base = document.body.getAttribute("data-base") || "";

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---- media slots: fill each <figure data-slot> from js/media.js ----
  var media = window.MEDIA || {};
  document.querySelectorAll("[data-slot]").forEach(function (fig) {
    var name = fig.getAttribute("data-slot");
    var src = media[name];
    var alt = fig.getAttribute("data-alt") || "";
    if (src) {
      var isVideo = /\.(mp4|webm)$/i.test(src);
      if (isVideo) {
        var v = document.createElement("video");
        v.src = base + src;
        v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
        v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
        if (alt) v.setAttribute("aria-label", alt);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.autoplay = false;
        fig.insertBefore(v, fig.firstChild);
      } else {
        var im = document.createElement("img");
        im.src = base + src;
        im.alt = alt;
        im.loading = fig.hasAttribute("data-eager") ? "eager" : "lazy";
        fig.insertBefore(im, fig.firstChild);
      }
    } else {
      var empty = document.createElement("div");
      empty.className = "slot-empty";
      fig.title = name + " " + (fig.getAttribute("data-size") || "");
      empty.innerHTML = "<b>" + esc(name) + "</b><span>" + esc(fig.getAttribute("data-size") || "") + "</span>";
      fig.insertBefore(empty, fig.firstChild);
    }
  });

  // ---- eyes blinking in the dark ----
  document.querySelectorAll("[data-eyes]").forEach(function (zone) {
    var n = parseInt(zone.getAttribute("data-eyes"), 10) || 3;
    for (var i = 0; i < n; i++) {
      var e = document.createElement("span");
      e.className = "eyes" + (Math.random() < 0.35 ? " lilac" : "") + (Math.random() < 0.5 ? " small" : "");
      e.innerHTML = "<i></i><i></i>";
      e.setAttribute("aria-hidden", "true");
      // keep them in the edges so they never sit behind text
      var left = Math.random() < 0.5 ? Math.random() * 12 : 88 + Math.random() * 9;
      e.style.left = left + "%";
      e.style.top = (8 + Math.random() * 80) + "%";
      e.style.setProperty("--blink", (3.5 + Math.random() * 5).toFixed(2) + "s");
      e.style.setProperty("--delay", (-Math.random() * 6).toFixed(2) + "s");
      zone.appendChild(e);
    }
  });

  function card(p) {
    var meta = [p.tag, p.location, p.year].filter(Boolean).join(", ");
    var inner =
      '<div class="card-media"><img src="' + base + esc(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy" width="600" height="600"></div>' +
      '<h3 class="card-title">' + esc(p.title) + "</h3>" +
      '<p class="card-meta">' + esc(meta) +
      (p.page ? "" : ' <span class="card-soon">/ page soon</span>') + "</p>";
    return p.page
      ? '<a class="card" href="' + base + esc(p.page) + '">' + inner + "</a>"
      : '<div class="card">' + inner + "</div>";
  }

  var list = window.PROJECTS || [];
  document.querySelectorAll("[data-grid]").forEach(function (grid) {
    var kind = grid.getAttribute("data-grid");
    var items = list.filter(function (p) {
      if (kind === "featured") return p.featured;
      return p.type === kind;
    });
    grid.innerHTML = items.map(card).join("");
  });

  // Lightbox for project galleries
  // (works for every .gallery on the page; a button's data-full is the big version)
  var galleries = document.querySelectorAll(".gallery");
  if (galleries.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML = '<button class="lightbox-close" type="button">close ✕</button><img alt="">';
    document.body.appendChild(box);
    var big = box.querySelector("img");
    var closeBtn = box.querySelector(".lightbox-close");
    var lastFocus = null;

    function close() {
      box.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    function open(e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var img = btn.querySelector("img");
      big.src = btn.getAttribute("data-full") || img.currentSrc || img.src;
      big.alt = img.alt;
      lastFocus = btn;
      box.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }
    galleries.forEach(function (g) { g.addEventListener("click", open); });
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target === closeBtn) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !box.hidden) close();
    });
  }

  // Contact form: posts to Netlify Forms when the site is hosted on Netlify.
  var form = document.querySelector("form[data-contact]");
  if (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      status.className = "form-status";
      status.textContent = "Sending…";
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          status.className = "form-status ok";
          status.textContent = "Message sent. I'll get back to you within a few days.";
        })
        .catch(function () {
          status.className = "form-status err";
          status.textContent = "The message didn't go through. Email me at cosmicdroidworld@gmail.com instead.";
        });
    });
  }
})();

// ---- header: phone menu, and its height for full-screen sections ----
(function () {
  var header = document.querySelector(".site-header");
  if (!header) return;
  var btn = header.querySelector(".menu-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("is-open")) btn.click();
    });
  }
  function setHeight() {
    document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  }
  setHeight();
  window.addEventListener("resize", setHeight);
})();

// ---- your logo files (set "logo-icon" and "logo-wordmark" in js/media.js) ----
(function () {
  var base = document.body.getAttribute("data-base") || "";
  var media = window.MEDIA || {};
  document.querySelectorAll("[data-logo]").forEach(function (el) {
    var src = media[el.getAttribute("data-logo")];
    if (!src) return;
    el.innerHTML = '<img src="' + base + src + '" alt="cosmicdroid">';
  });
})();

// ---- works deck: cards side by side, the one you point at opens ----
(function () {
  var decks = document.querySelectorAll("[data-deck]");
  if (!decks.length) return;
  var base = document.body.getAttribute("data-base") || "";
  var list = window.PROJECTS || [];
  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function pick(kind, filter) {
    return list.filter(function (p) {
      if (kind === "featured") return p.featured;
      var f = filter || kind;
      return f === "all" ? true : p.type === f;
    });
  }
  function cardHtml(p, i) {
    var meta = [p.tag, p.location, p.year].filter(Boolean).join(" / ");
    var n = (i + 1 < 10 ? "0" : "") + (i + 1);
    var inner =
      '<span class="deck-num">' + n + "</span>" +
      (p.page ? '<span class="deck-go">open ↗</span>' : "") +
      '<div class="deck-img"><img src="' + base + esc(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy" width="600" height="600"></div>' +
      '<div class="deck-label"><b>' + esc(p.title) + "</b><span>" + esc(meta) + (p.page ? "" : " / page soon") + "</span></div>";
    return p.page
      ? '<a class="deck-card" href="' + base + esc(p.page) + '">' + inner + "</a>"
      : '<div class="deck-card" tabindex="0">' + inner + "</div>";
  }
  function open(deck, card) {
    deck.querySelectorAll(".deck-card.is-open").forEach(function (c) { if (c !== card) c.classList.remove("is-open"); });
    card.classList.add("is-open");
  }
  function build(deck, filter) {
    var items = pick(deck.getAttribute("data-deck"), filter);
    deck.innerHTML = items.length ? items.map(cardHtml).join("") : '<p class="deck-empty">Nothing here yet.</p>';
    var cards = deck.querySelectorAll(".deck-card");
    if (cards[0]) cards[0].classList.add("is-open");
    cards.forEach(function (c) {
      c.addEventListener("mouseenter", function () { open(deck, c); });
      c.addEventListener("focus", function () { open(deck, c); });
    });
  }
  decks.forEach(function (deck) {
    build(deck);
    var bar = deck.parentElement.querySelector(".deck-filters");
    if (!bar) return;
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (!b) return;
      bar.querySelectorAll("[data-filter]").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      build(deck, b.getAttribute("data-filter"));
      deck.scrollLeft = 0;
    });
  });
})();

// ---- loading screen: the Leap Kill guy runs until the page has loaded ----
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("is-loading")) return;
  var loader = document.getElementById("loader");
  var started = Date.now();
  var done = false;
  function finish() {
    if (done) return;
    done = true;
    var wait = Math.max(0, 1100 - (Date.now() - started)); // show him for at least about a second
    setTimeout(function () {
      if (loader) loader.classList.add("is-done");
      setTimeout(function () { root.classList.remove("is-loading"); }, 380);
      try { sessionStorage.setItem("cd-loaded", "1"); } catch (e) {}
    }, wait);
  }
  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish);
  setTimeout(finish, 4500);
})();

// ---- the room rows on the homepage: your own art per room (set "room-1".."room-6" in js/media.js) ----
(function () {
  var base = document.body.getAttribute("data-base") || "";
  var media = window.MEDIA || {};
  document.querySelectorAll("[data-room-art]").forEach(function (a) {
    var src = media[a.getAttribute("data-room-art")];
    if (!src) return;
    var art = a.querySelector(".room-art");
    if (art) art.innerHTML = '<img src="' + base + src + '" alt="" loading="lazy">';
  });
})();

// ---- footer: a new frog fact every 10 seconds ----
// The real facts were checked against the Smithsonian ("14 Fun Facts About Frogs"),
// the American Museum of Natural History ("Frog Fun Facts") and frog research news;
// the jokes at the end are, obviously, not science. Add or edit freely.
(function () {
  var box = document.querySelector("[data-frog-facts]");
  if (!box) return;
  var FACTS = [
    "A group of frogs is called an army.",
    "Frogs blink when they swallow: their eyeballs sink down and help push food into their throat.",
    "Wood frogs freeze solid in winter, up to 65% of their body, and thaw back to life in spring.",
    "Glass frogs have see-through skin. You can watch their hearts beat.",
    "Male Darwin's frogs raise tadpoles inside their vocal sac, then cough up tiny froglets.",
    "Frogs shed their skin about once a week, and usually eat it.",
    "The goliath frog of West Africa can be over a foot long and weigh more than 7 pounds.",
    "Many frogs can leap more than 20 times their own body length.",
    "Frogs have been around for more than 200 million years, about as long as the dinosaurs.",
    "The Australian water-holding frog can wait up to seven years for rain, wrapped in a cocoon of its own shed skin.",
    "Frogs were the first land animals with vocal cords. Some calls carry for a mile.",
    "The Costa Rican flying tree frog glides from tree to tree on its webbed fingers and toes.",
    "Waxy monkey frogs rub wax all over their bodies with their legs, like sunscreen.",
    "One Indonesian frog has no lungs at all. It breathes only through its skin.",
    "Most frogs have teeth, but usually only on their upper jaw.",
    "The gastric-brooding frog raised her tadpoles in her stomach, switching off her stomach acid so she wouldn't digest them.",
    // weird but true
    "Frogs don't drink with their mouths. They soak water up through their skin.",
    "When a frog swallows something bad, it can throw up its whole stomach, wipe it clean with its hand, and swallow it back.",
    "The hairy frog breaks its own toe bones to make claws. Metal.",
    "Grab a frog and there's a good chance it pees on you. That's a defense move, not a personal opinion.",
    "Male frogs in a hurry sometimes hug the wrong thing: other males, fish, even floating sticks.",
    "The purple frog spends almost its whole life underground and looks like a lost grape with a nose.",
    "A frog's tongue is softer than yours, and its spit turns from runny to sticky and back again in a split second.",
    // not exactly science
    "Frogs are always happy because they eat whatever bugs them.",
    "Frogs never run out of dates. Every year is a leap year.",
    "If a frog parks in the wrong spot, it gets toad away.",
    "Frogs make terrible secret agents. They always croak under pressure.",
    "A frog's favorite drink is Croak-a-Cola, served with a fly on top.",
    "Frogs don't get stressed. They just hop it off.",
    "This website was drawn, coded and approved by frogs.",
    "The Frog has never paid rent. He just hops between castles.",
    "Scientists agree frogs are at least 40% vibes. The other 60% is legs."
  ];
  var text = box.querySelector(".fact-text");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // start somewhere random, then go through them all in a shuffled order
  var order = FACTS.map(function (_, i) { return i; });
  for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
  var at = 0;
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  var GLYPHS = "!<>-_\\/[]{}=+*^?#░▒▓@$%&";
  var raf = 0;
  function decode(target) {
    // the new fact resolves out of scrambled characters, left to right
    cancelAnimationFrame(raf);
    var t0 = performance.now(), dur = Math.min(900, 300 + target.length * 9);
    (function frame(now) {
      var k = Math.min(1, (now - t0) / dur), done = Math.floor(target.length * k), out = "";
      for (var c = 0; c < target.length; c++) {
        var ch = target[c];
        if (c < done || ch === " ") out += ch;
        else if (c < done + 12) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else out += " ";
      }
      text.textContent = out;
      if (k < 1) raf = requestAnimationFrame(frame);
      else text.textContent = target;
    })(t0);
  }
  function show(idx, animate) {
    var fact = FACTS[order[idx]];
    text.setAttribute("aria-label", fact);
    if (!animate || reduce) { text.textContent = fact; return; }
    box.classList.add("is-swapping");                       // old fact slides up and out
    setTimeout(function () {
      box.classList.remove("is-swapping");
      box.classList.add("is-in");
      decode(fact);                                          // new fact decodes in
      setTimeout(function () { box.classList.remove("is-in"); }, 450);
    }, 280);
  }
  show(at, false);
  var timer = setInterval(function () { at = (at + 1) % order.length; show(at, true); }, 10000);
  // pause while someone is reading it with the mouse on it
  box.addEventListener("mouseenter", function () { clearInterval(timer); });
  box.addEventListener("mouseleave", function () {
    clearInterval(timer);
    timer = setInterval(function () { at = (at + 1) % order.length; show(at, true); }, 10000);
  });
})();

// ---- homepage: the menu bar turns purple as you scroll down to the moving banner ----
// 0% at the top of the page, 100% the moment the bar touches the purple banner (#more).
(function () {
  var header = document.querySelector(".site-header");
  var banner = document.getElementById("more");
  if (!header || !banner) return;
  var FROM = [220, 233, 251];   // --paper  #dce9fb
  var TO = [179, 119, 255];     // logo square #b377ff
  var dist = 1, tick = false;
  function measure() {
    var fr = header.parentElement;
    var barBottomAtTop = fr.getBoundingClientRect().top + window.scrollY + fr.clientTop + header.offsetHeight;
    var bannerTop = banner.getBoundingClientRect().top + window.scrollY;
    dist = Math.max(1, bannerTop - barBottomAtTop);
  }
  function update() {
    tick = false;
    var gap = banner.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    var p = Math.min(1, Math.max(0, 1 - gap / dist));
    var c = FROM.map(function (v, i) { return Math.round(v + (TO[i] - v) * p); });
    header.style.setProperty("--hdr-bg", "rgb(" + c.join(",") + ")");
    // once it touches the banner, the menu links switch to the yellow wordmark style
    header.classList.toggle("is-purple", p >= 0.999);
  }
  function onScroll() { if (!tick) { tick = true; requestAnimationFrame(update); } }
  measure(); update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { measure(); update(); });
  window.addEventListener("load", function () { measure(); update(); });
})();

// ---- project pages: looping videos play only while they're on screen ----
(function () {
  var vids = document.querySelectorAll("video[data-autoplay]");
  if (!vids.length) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { vids.forEach(function (v) { v.controls = true; }); return; }
  if (!("IntersectionObserver" in window)) { vids.forEach(function (v) { v.autoplay = true; v.play && v.play().catch(function () {}); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { if (v.preload === "none") v.preload = "auto"; var p = v.play(); if (p) p.catch(function () {}); }
      else v.pause();
    });
  }, { threshold: 0.25 });
  vids.forEach(function (v) { io.observe(v); });
})();

// ---- Big cats viewer: hover / tap / swipe / arrows; the section takes each cat's background color ----
(function () {
  var root = document.querySelector("[data-cats]");
  if (!root) return;
  var img = root.querySelector("[data-cat-img]");
  var num = root.querySelector("[data-cat-n]");
  var strip = root.querySelector("[data-cat-strip]");
  var thumbs = Array.prototype.slice.call(root.querySelectorAll(".cat-thumb"));
  var total = thumbs.length, cur = 1, shuffling = false;
  var base = "../assets/img/big-cats-collection/cats/";
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var coarse = window.matchMedia && matchMedia("(hover: none)").matches;

  function show(n, scroll) {
    n = ((n - 1 + total) % total) + 1;
    if (n === cur && img.getAttribute("src").indexOf(pad(n) + ".webp") > -1) return;
    cur = n;
    var t = thumbs[n - 1];
    root.style.setProperty("--cat-bg", t.getAttribute("data-bg"));
    img.src = base + pad(n) + ".webp";
    img.alt = "Big cat " + pad(n) + " of " + total;
    img.classList.remove("is-pop"); void img.offsetWidth; img.classList.add("is-pop");
    num.textContent = pad(n);
    thumbs.forEach(function (x) { x.classList.toggle("is-on", x === t); });
    if (scroll) {
      // keep the active thumb visible without scrolling the page
      var sr = strip.getBoundingClientRect(), tr = t.getBoundingClientRect();
      if (getComputedStyle(strip).display === "flex") strip.scrollTo({ left: strip.scrollLeft + tr.left - sr.left - (sr.width - tr.width) / 2, behavior: "smooth" });
      else if (tr.top < sr.top || tr.bottom > sr.bottom) strip.scrollTo({ top: strip.scrollTop + tr.top - sr.top - (sr.height - tr.height) / 2, behavior: "smooth" });
    }
    // warm up the neighbours
    [n + 1, n - 1].forEach(function (k) { var i = new Image(); i.src = base + pad(((k - 1 + total) % total) + 1) + ".webp"; });
  }
  thumbs[0].classList.add("is-on");
  thumbs.forEach(function (t) {
    var n = +t.getAttribute("data-cat");
    if (!coarse) t.addEventListener("mouseenter", function () { if (!shuffling) show(n); });
    t.addEventListener("click", function () { shuffling = false; show(n, true); });
    t.addEventListener("focus", function () { if (!shuffling) show(n); });
  });
  root.querySelectorAll("[data-cat-step]").forEach(function (b) {
    b.addEventListener("click", function () { shuffling = false; show(cur + +b.getAttribute("data-cat-step"), true); });
  });
  // shuffle: flicks through a few cats like a slot machine, then lands
  root.querySelector("[data-cat-random]").addEventListener("click", function () {
    if (shuffling) return;
    shuffling = true;
    var steps = 9 + Math.floor(Math.random() * 6), i = 0;
    (function spin() {
      if (!shuffling) return;
      var n; do { n = 1 + Math.floor(Math.random() * total); } while (n === cur);
      show(n, i === steps);
      if (++i <= steps) setTimeout(spin, 50 + i * i * 2.2); else shuffling = false;
    })();
  });
  // swipe on the big cat (phones)
  var sx = null, sy = null;
  img.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  img.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1), true);
    sx = null;
  });
  // keyboard arrows while the viewer is on screen
  var visible = false;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.4 }).observe(root);
  document.addEventListener("keydown", function (e) {
    if (!visible || e.target.closest("input, textarea, select")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); show(cur + 1, true); }
    if (e.key === "ArrowLeft") { e.preventDefault(); show(cur - 1, true); }
  });
})();

// ---- Leap Kill "packed by hand": camcorder readout synced to the speed-ramped video ----
(function () {
  var root = document.querySelector("[data-lk-pack]");
  if (!root) return;
  var v = root.querySelector("video"), spd = root.querySelector("[data-pack-speed]"),
      tm = root.querySelector("[data-pack-time]"), bar = root.querySelector("[data-pack-bar]");
  // same curve the video was edited with: 1x, ease to 4x at 0:04, back to 1x for the last 4 seconds of footage
  function ease(x) { x = Math.min(1, Math.max(0, x)); return 0.5 - 0.5 * Math.cos(Math.PI * x); }
  function speed(t) {
    if (t < 4) return 1;
    if (t < 4.8) return 1 + 3 * ease((t - 4) / 0.8);
    if (t < 20.5) return 4;
    if (t < 21.3) return 1 + 3 * ease((21.3 - t) / 0.8);
    return 1;
  }
  // real footage time for each moment of the edited clip
  var real = [0], step = 1 / 60;
  for (var i = 1; i < 60 * 30; i++) real[i] = real[i - 1] + speed(i * step) * step;
  function fmt(s) { s = Math.floor(s); return (s < 600 ? "0" : "") + Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }
  var raf = null;
  function tick() {
    var t = v.currentTime || 0, sp = speed(t);
    spd.textContent = (sp > 1.05 ? "▶▶ x" : "▶ x") + sp.toFixed(1);
    spd.classList.toggle("is-fast", sp > 1.05);
    tm.textContent = fmt(real[Math.min(real.length - 1, Math.round(t / step))]);
    if (v.duration) bar.style.width = (100 * t / v.duration) + "%";
    raf = v.paused ? null : requestAnimationFrame(tick);
  }
  v.addEventListener("play", function () { if (!raf) raf = requestAnimationFrame(tick); });
  v.addEventListener("seeked", tick);
})();
