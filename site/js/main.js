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
  var galleries = document.querySelectorAll(".gallery, .bento");
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
      ? '<a class="deck-card" data-slug="' + esc(p.slug) + '" href="' + base + esc(p.page) + '">' + inner + "</a>"
      : '<div class="deck-card" tabindex="0">' + inner + "</div>";
  }
  function open(deck, card) {
    deck.querySelectorAll(".deck-card.is-open").forEach(function (c) { if (c !== card) c.classList.remove("is-open"); });
    card.classList.add("is-open");
  }
  // remember the project you opened, so coming back shows it open in the deck (per page)
  var MEM = "cd-deck:" + location.pathname;
  function remember(slug, filter) { try { sessionStorage.setItem(MEM, JSON.stringify({ slug: slug, filter: filter })); } catch (e) {} }
  function recall() { try { return JSON.parse(sessionStorage.getItem(MEM) || "null"); } catch (e) { return null; } }
  // Works page: a grid of cards that fade up as they come on screen; hover zooms the picture (CSS)
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function gridCard(p, i) {
    var meta = [p.tag, p.year].filter(Boolean).join(" · ");
    var n = (i + 1 < 10 ? "0" : "") + (i + 1);
    var inner =
      '<div class="wg-img"><img src="' + base + esc(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy" width="600" height="600"></div>' +
      '<span class="wg-num">' + n + "</span>" +
      (p.page ? '<span class="wg-go">open ↗</span>' : '<span class="wg-go wg-soon">soon</span>') +
      '<div class="wg-label"><b>' + esc(p.title) + '</b><span class="wg-meta">' + esc(meta) + "</span></div>";
    var attrs = ' class="wg-card" style="--i:' + i + '" data-slug="' + esc(p.slug) + '"';
    return p.page ? "<a" + attrs + ' href="' + base + esc(p.page) + '">' + inner + "</a>" : "<div" + attrs + ' tabindex="0">' + inner + "</div>";
  }
  function buildGrid(deck, filter, focusSlug) {
    var items = pick("all", filter);
    deck.innerHTML = items.length ? items.map(gridCard).join("") : '<p class="deck-empty">Nothing here yet.</p>';
    var cards = deck.querySelectorAll(".wg-card");
    cards.forEach(function (c) {
      if (focusSlug && c.getAttribute("data-slug") === focusSlug) c.classList.add("is-last");
      c.addEventListener("click", function () { remember(c.getAttribute("data-slug"), deck.getAttribute("data-filter-now") || "all"); });
      // once it has risen in, drop the entrance animation
      c.addEventListener("animationend", function () { c.classList.add("is-done"); });
    });
    // rise in as they come on screen
    if (calm || !("IntersectionObserver" in window)) { cards.forEach(function (c) { c.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty("--d", (k++ * 70) + "ms");
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    cards.forEach(function (c) { io.observe(c); });
  }
  function build(deck, filter, focusSlug) {
    if (deck.hasAttribute("data-grid")) return buildGrid(deck, filter, focusSlug);
    var items = pick(deck.getAttribute("data-deck"), filter);
    // card sizes always follow the "All works" count, so a short filter (Murals) doesn't blow cards up
    deck.style.setProperty("--deck-n", pick(deck.getAttribute("data-deck")).length);
    deck.innerHTML = items.length ? items.map(cardHtml).join("") : '<p class="deck-empty">Nothing here yet.</p>';
    var cards = deck.querySelectorAll(".deck-card");
    var start = cards[0];
    if (focusSlug) cards.forEach(function (c) { if (c.getAttribute("data-slug") === focusSlug) start = c; });
    if (start) {
      start.classList.add("is-open");
      if (start !== cards[0]) requestAnimationFrame(function () {
        // slide the deck sideways (not the page) so the remembered card is in view
        deck.scrollLeft = Math.max(0, start.offsetLeft - deck.offsetLeft - (deck.clientWidth - start.offsetWidth) / 2);
      });
    }
    cards.forEach(function (c) {
      c.addEventListener("mouseenter", function () { open(deck, c); });
      c.addEventListener("focus", function () { open(deck, c); });
      c.addEventListener("click", function () { remember(c.getAttribute("data-slug"), deck.getAttribute("data-filter-now") || "all"); });
    });
  }
  decks.forEach(function (deck) {
    var saved = recall();
    var bar = deck.parentElement.querySelector(".deck-filters");
    var f = saved && saved.filter && bar && bar.querySelector('[data-filter="' + saved.filter + '"]') ? saved.filter : null;
    if (f && bar) bar.querySelectorAll("[data-filter]").forEach(function (x) { x.setAttribute("aria-selected", x.getAttribute("data-filter") === f ? "true" : "false"); });
    deck.setAttribute("data-filter-now", f || "all");
    build(deck, f && f !== "all" ? f : undefined, saved && saved.slug);
    if (!bar) return;
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (!b) return;
      bar.querySelectorAll("[data-filter]").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      deck.setAttribute("data-filter-now", b.getAttribute("data-filter"));
      if (deck.hasAttribute("data-grid") && !calm) {
        // old cards drop away, then the new set rises in
        deck.classList.add("is-leaving");
        setTimeout(function () { deck.classList.remove("is-leaving"); build(deck, b.getAttribute("data-filter")); }, 260);
        return;
      }
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
// ON HOLD (owner, Oct 26): the bar is purple on every page from the start (body.bar-purple).
// To bring the fade back, remove "class=bar-purple" from the home page in tools/build.py and FADE = true.
(function () {
  var FADE = false;
  if (!FADE) return;
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


// ---- a normal visit to a page always starts at the top (the back button still returns you to where you were) ----
(function () {
  if (location.hash) return;
  var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (nav && nav.type !== "navigate") return;
  try { if ("scrollRestoration" in history) history.scrollRestoration = "auto"; } catch (e) {}
  function top() {
    var html = document.documentElement, prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    // when the site is shown inside another page (like a preview), ask that page to scroll to the top too
    if (window.self !== window.top) { try { document.body.scrollIntoView({ block: "start", behavior: "auto" }); } catch (e) {} }
    html.style.scrollBehavior = prev;
  }
  top();
  window.addEventListener("load", function () { if (window.scrollY > 0 && !userScrolled) top(); });
  var userScrolled = false;
  ["wheel", "touchstart", "keydown"].forEach(function (ev) { window.addEventListener(ev, function () { userScrolled = true; }, { once: true, passive: true }); });
})();

// the purple banner above the footer is as tall as the frog fact row below it (desktop only)
(function () {
  var cta = document.querySelector(".cta"), facts = document.querySelector(".foot-facts");
  if (!cta || !facts) return;
  function fit() {
    cta.style.minHeight = window.innerWidth > 760 ? facts.offsetHeight + "px" : "";
  }
  fit();
  window.addEventListener("resize", fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(facts);
})();

// ---- work pages: drag across the art to compare the sketch with the final ----
(function () {
  document.querySelectorAll("[data-compare]").forEach(function (box) {
    var range = box.querySelector(".compare-range");
    function set(v) { box.style.setProperty("--pos", v + "%"); }
    range.addEventListener("input", function () { set(range.value); });
    // a little nudge the first time it comes on screen, so people see it moves
    if (!("IntersectionObserver" in window) || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      var t0 = performance.now();
      (function tick(now) {
        var k = Math.min(1, (now - t0) / 1600);
        var v = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k);
        set(v.toFixed(1)); range.value = v;
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.5 });
    io.observe(box);
  });
})();

// ---- email links: also copy the address, in case no mail app opens (common with Gmail-only setups
//      or inside embedded previews). A little "copied" note shows next to it. ----
(function () {
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
    a.addEventListener("click", function () {
      var addr = a.getAttribute("href").replace(/^mailto:/, "").split("?")[0];
      var done = function () {
        var note = document.createElement("span");
        note.className = "copied-note";
        note.textContent = "email copied ✓";
        a.appendChild(note);
        setTimeout(function () { note.remove(); }, 1800);
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr).then(done, function () {});
      } catch (e) {}
    });
  });
})();

// ---- light / dark mode ----
// The page starts in the visitor's device setting (set in <head> before paint). The moon/sun
// button in the menu bar switches it, and that choice is remembered on this browser.
(function () {
  var root = document.documentElement;
  var btns = document.querySelectorAll("[data-theme-toggle]");
  function current() { return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function sync() {
    var dark = current() === "dark";
    btns.forEach(function (b) {
      b.setAttribute("aria-pressed", dark ? "true" : "false");
      b.setAttribute("aria-label", dark ? "Light mode" : "Dark mode");
      b.title = dark ? "Light mode" : "Dark mode";
    });
  }
  function set(t, save) {
    root.setAttribute("data-theme", t);
    if (save) { try { localStorage.setItem("cd-theme", t); } catch (e) {} }
    sync();
  }
  if (!root.getAttribute("data-theme")) {   // (normally already set in <head>)
    var t = null; try { t = localStorage.getItem("cd-theme"); } catch (e) {}
    if (t !== "dark" && t !== "light") t = (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    set(t, false);
  }
  btns.forEach(function (b) {
    b.addEventListener("click", function () { set(current() === "dark" ? "light" : "dark", true); });
  });
  // follow the device while the visitor hasn't picked one here
  try {
    var mq = matchMedia("(prefers-color-scheme: dark)");
    var follow = function (e) {
      var saved = null; try { saved = localStorage.getItem("cd-theme"); } catch (x) {}
      if (saved !== "dark" && saved !== "light") set(e.matches ? "dark" : "light", false);
    };
    if (mq.addEventListener) mq.addEventListener("change", follow); else if (mq.addListener) mq.addListener(follow);
  } catch (e) {}
  sync();
})();
