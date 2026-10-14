// Leap Kill reader: the comic as a real book.
// The open book is two flat pages (left and right). When you turn a page, one
// sheet of paper is lifted into 3D and rotated around the spine, bending a
// little while it moves; underneath it the next pages are already in place.
// Only that one sheet is ever 3D, so it stays smooth and works the same in
// Safari, Chrome, Firefox and on phones.
// Wide screens show two-page spreads; phones show one page at a time, and the
// back of a turning page is blank paper (like a notebook).
// Turn pages by dragging or tapping a page, with the buttons, or with ← →.
(function () {
  var root = document.querySelector("[data-flipbook]");
  if (!root) return;

  var book = root.querySelector(".lk-book");
  var size = root.querySelector(".lk-book-size");
  var shift = root.querySelector(".lk-book-shift");
  var stage = root.querySelector(".lk-stage");
  var controls = root.querySelector(".lk-controls");
  var prevBtn = root.querySelector("[data-prev]");
  var nextBtn = root.querySelector("[data-next]");
  var countText = root.querySelector(".lk-count-text");
  var bar = root.querySelector(".lk-progress span");
  var nudge = root.querySelector(".lk-nudge");

  // the page pictures, in reading order
  var srcs = [];
  book.querySelectorAll(".lk-page img").forEach(function (im) { srcs.push(im.getAttribute("src")); });
  var total = srcs.length;
  if (!total) return;

  var PW = 900, PH = 1386, RATIO = PW / PH;
  var MIN_PAGE = 240;             // narrower than this per page → one page at a time
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DURATION = reduce ? 260 : 900;
  var CURL = reduce ? 0 : 30;     // how much the paper bends while turning (degrees)
  var SEGMENTS = [0.45, 0.3, 0.25]; // the turning sheet is made of strips so it can bend

  var mode = "";                  // "spread" or "single"
  var pos = 0;                    // spread: sheets turned over (0 = cover). single: page index
  var maxPos = 0;
  var busy = false;
  var pageW = 0, pageH = 0;

  // ---------- the parts of the book ----------
  book.innerHTML = "";
  book.classList.add("is-ready");
  var fb = el("div", "fb");
  var left = el("div", "fb-page fb-left");
  var right = el("div", "fb-page fb-right");
  var turn = el("div", "fb-turn");
  fb.appendChild(left); fb.appendChild(right); fb.appendChild(turn);
  book.appendChild(fb);

  function el(tag, cls) { var e = document.createElement(tag); e.className = cls; return e; }
  function show(pageEl, src) {
    pageEl.style.backgroundImage = src ? "url(" + src + ")" : "";
    pageEl.classList.toggle("is-empty", !src);
  }

  // the sheet that turns: strips nested inside each other, each with a front and a back
  var strips = [];
  (function buildTurn() {
    var parent = turn, start = 0;
    for (var s = 0; s < SEGMENTS.length; s++) {
      var w = SEGMENTS[s];
      var seg = el("div", "fb-seg");
      seg.style.width = (w / (1 - start)) * 100 + "%";
      var front = el("div", "fb-face fb-front");
      var back = el("div", "fb-face fb-back");
      seg.appendChild(front); seg.appendChild(back);
      parent.appendChild(seg);
      strips.push({ seg: seg, front: front, back: back, start: start, w: w });
      if (s < SEGMENTS.length - 1) {
        var holder = el("div", "fb-holder");
        holder.style.width = ((1 - start - w) / w) * 100 + "%";
        seg.appendChild(holder);
        parent = holder;
      }
      start += w;
    }
  })();

  function slice(face, src, start, w, isBack) {
    face.classList.toggle("fb-paper", !src);
    if (!src) { face.style.backgroundImage = ""; return; }
    face.style.backgroundImage = "url(" + src + ")";
    // the back of the sheet is seen mirrored, so its slice comes from the other end
    var from = isBack ? 1 - start - w : start;
    face.style.backgroundSize = (100 / w) + "% 100%";
    face.style.backgroundPosition = (from / (1 - w)) * 100 + "% 0";
  }
  function loadTurn(frontSrc, backSrc) {
    strips.forEach(function (st) {
      slice(st.front, frontSrc, st.start, st.w, false);
      slice(st.back, backSrc, st.start, st.w, true);
    });
  }

  // angle: 0 = lying on the right, -180 = lying on the left. bend: extra rotation of the outer strips.
  function setAngle(angle, bend) {
    var n = strips.length;
    for (var s = 0; s < n; s++) {
      var a = s === 0 ? angle : bend * (s / (n - 1));
      strips[s].seg.style.transform = "rotateY(" + a.toFixed(2) + "deg)";
    }
    var up = Math.sin(Math.min(180, Math.max(0, -angle)) * Math.PI / 180);
    turn.style.setProperty("--shade", (up * 0.28).toFixed(3));
    // the page being uncovered sits in the sheet's shadow while it's lifted
    fb.style.setProperty("--cast", (up * 0.22).toFixed(3));
    turn.dataset.angle = angle;
  }
  function getAngle() { return parseFloat(turn.dataset.angle) || 0; }

  // ---------- what the flat pages show ----------
  // spread, at position p: left = back of sheet p-1 = page 2p-1, right = front of sheet p = page 2p
  function spreadLeft(p) { return p > 0 ? srcs[2 * p - 1] || null : null; }
  function spreadRight(p) { return srcs[2 * p] || null; }

  function rest() {
    // the book lying still: no 3D at all
    turn.classList.remove("is-on");
    fb.style.setProperty("--cast", 0);
    if (mode === "spread") { show(left, spreadLeft(pos)); show(right, spreadRight(pos)); }
    else { show(right, srcs[pos]); show(left, null); }
    update();
  }

  // ---------- turning ----------
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var raf = 0;
  function animate(from, to, dir, dur, done) {
    busy = true;
    cancelAnimationFrame(raf);
    var t0 = performance.now();
    (function frame(now) {
      var k = Math.min(1, (now - t0) / dur);
      var a = from + (to - from) * ease(k);
      // the outer edge leads, bending most in the middle of the turn
      setAngle(a, dir * -CURL * Math.sin(Math.PI * Math.abs(a) / 180));
      if (k < 1) { raf = requestAnimationFrame(frame); return; }
      setAngle(to, 0);
      busy = false;
      done();
    })(t0);
  }

  // lift the sheet that is about to turn, and put the pages that will be uncovered underneath it
  function lift(dir) {
    if (mode === "spread") {
      if (dir > 0) { // sheet `pos` goes right → left
        loadTurn(srcs[2 * pos] || null, srcs[2 * pos + 1] || null);
        show(right, spreadRight(pos + 1));
        show(left, spreadLeft(pos));
        setAngle(0, 0);
      } else {       // sheet `pos-1` goes left → right
        loadTurn(srcs[2 * pos - 2] || null, srcs[2 * pos - 1] || null);
        show(left, spreadLeft(pos - 1));
        show(right, spreadRight(pos));
        setAngle(-180, 0);
      }
    } else {
      if (dir > 0) { loadTurn(srcs[pos], null); show(right, srcs[pos + 1]); setAngle(0, 0); }
      else { loadTurn(srcs[pos - 1], null); show(right, srcs[pos]); setAngle(-180, 0); }
    }
    turn.classList.add("is-on");
  }

  function go(dir) {
    if (busy) return;
    if (dir > 0 && pos >= maxPos) return;   // at the back cover: nothing happens
    if (dir < 0 && pos <= 0) return;        // at the front cover: nothing happens
    hideNudge();
    lift(dir);
    shiftFor(pos + dir);
    animate(getAngle(), dir > 0 ? -180 : 0, dir, DURATION, function () { pos += dir; rest(); });
  }
  function next() { go(1); }
  function prev() { go(-1); }

  // ---------- centring the closed book (cover alone on the right, back cover alone on the left) ----------
  function shiftFor(p) {
    if (mode !== "spread") { shift.style.transform = ""; return; }
    shift.style.transform = p <= 0 ? "translateX(-25%)" : p >= maxPos ? "translateX(25%)" : "translateX(0)";
  }

  // ---------- counter, buttons ----------
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function currentPage() { return mode === "spread" ? Math.min(total - 1, pos * 2) : pos; }
  function update() {
    var label, seen;
    if (mode === "single") {
      label = pos === 0 ? "cover" : pos === total - 1 ? "back cover" : "page <b>" + pad(pos + 1) + "</b> / " + total;
      seen = (pos + 1) / total;
    } else if (pos === 0) {
      label = "cover"; seen = 1 / total;
    } else if (pos >= maxPos) {
      label = "back cover"; seen = 1;
    } else {
      var l = pos * 2 - 1;
      label = "pages <b>" + pad(l + 1) + "–" + pad(l + 2) + "</b> / " + total;
      seen = (l + 2) / total;
    }
    countText.innerHTML = label;
    bar.style.width = (seen * 100).toFixed(1) + "%";
    prevBtn.disabled = pos <= 0;
    nextBtn.disabled = pos >= maxPos;
    shiftFor(pos);
    fb.setAttribute("aria-label", "Leap Kill Vol. 01, " + countText.textContent);
    if (pos > 0) hideNudge();
  }
  function hideNudge() { if (nudge) nudge.classList.add("is-gone"); }

  // ---------- size: the whole book fits on screen ----------
  function fit() {
    var header = document.querySelector(".site-header");
    var headH = header ? header.offsetHeight : 0;
    var cs = getComputedStyle(stage);
    var padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    var padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var gap = parseFloat(cs.rowGap) || 16;
    var barEl = root.querySelector(".bar");
    var availW = stage.clientWidth - padX;
    var availH = window.innerHeight - headH - (barEl ? barEl.offsetHeight : 0) - padY - gap - (controls ? controls.offsetHeight : 0) - 8;
    // the open spread is chosen by width alone: a short window still gets a
    // two-page book (just a smaller one), never the one-page phone view
    var newMode = availW / 2 >= MIN_PAGE ? "spread" : "single";
    var spreadPage = Math.min(availW / 2, Math.max(availH, 380) * RATIO, 640);
    spreadPage = Math.max(spreadPage, Math.min(MIN_PAGE, availW / 2));
    availH = Math.max(availH, 280);
    pageW = Math.floor(newMode === "spread" ? spreadPage : Math.min(availW * 0.88, availH * RATIO, 520));
    pageH = Math.round(pageW / RATIO);
    var bookW = newMode === "spread" ? pageW * 2 : pageW;
    size.style.width = bookW + "px";
    fb.style.width = bookW + "px";
    fb.style.height = pageH + "px";
    fb.style.perspective = Math.round(pageW * 3.4) + "px";
    if (newMode !== mode) {
      var keep = mode ? currentPage() : 0;
      mode = newMode;
      fb.classList.toggle("is-single", mode === "single");
      shift.classList.remove("at-cover", "at-back", "is-portrait");
      if (mode === "spread") { maxPos = Math.ceil(total / 2); pos = Math.min(maxPos, Math.ceil(keep / 2)); }
      else { maxPos = total - 1; pos = Math.min(maxPos, keep); }
      cancelAnimationFrame(raf); busy = false;
      rest();
    }
  }

  // ---------- pointer: drag a page, or tap it ----------
  var drag = null;
  fb.addEventListener("pointerdown", function (e) {
    if (busy || e.button > 0) return;
    var r = fb.getBoundingClientRect();
    var x = e.clientX - r.left;
    var isRight = mode === "spread" ? x > r.width / 2 : x > r.width * 0.35;
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dir: isRight ? 1 : -1, started: false, p: 0, track: [[e.timeStamp, e.clientX]] };
    if (e.pointerType === "mouse") e.preventDefault();
  });
  window.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    drag.track.push([e.timeStamp, e.clientX]);
    if (drag.track.length > 10) drag.track.shift();
    if (!drag.started) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      // only drag the way the book can go
      if ((drag.dir > 0 && pos >= maxPos) || (drag.dir < 0 && pos <= 0)) { drag = null; return; }
      drag.started = true;
      hideNudge();
      lift(drag.dir);
      shiftFor(pos + drag.dir);
      try { fb.setPointerCapture(e.pointerId); } catch (err) {}
    }
    var span = mode === "spread" ? pageW * 1.6 : pageW * 1.2;
    var p = Math.max(0, Math.min(1, (drag.dir > 0 ? -dx : dx) / span));
    drag.p = p;
    setAngle(drag.dir > 0 ? -180 * p : -180 * (1 - p), drag.dir * -CURL * Math.sin(Math.PI * p));
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  function speed(track) {
    var last = track[track.length - 1], i = track.length - 1;
    while (i > 0 && last[0] - track[i - 1][0] < 100) i--;
    var dt = last[0] - track[i][0];
    return dt > 0 ? (last[1] - track[i][1]) / dt : 0; // px per ms
  }
  function release(e, cancelled) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag;
    drag = null;
    if (!d.started) {
      if (!cancelled) go(d.dir);   // a tap or click turns toward the side you touched
      return;
    }
    var v = -speed(d.track) * d.dir;   // positive = moving the way of the turn
    var finish = !cancelled && (d.p > 0.4 || v > 0.35);
    var target = d.dir > 0 ? (finish ? -180 : 0) : (finish ? 0 : -180);
    var a = getAngle();
    var dur = Math.max(200, DURATION * Math.abs(target - a) / 180);
    if (!finish) shiftFor(pos);
    animate(a, target, finish ? d.dir : -d.dir, dur, function () {
      if (finish) pos += d.dir;
      rest();
    });
  }
  window.addEventListener("pointerup", function (e) { release(e, false); });
  window.addEventListener("pointercancel", function (e) { release(e, true); });
  fb.addEventListener("dragstart", function (e) { e.preventDefault(); });

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  // ← → keys while the book is on screen and you're not typing
  var onScreen = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; }, { threshold: 0.25 }).observe(stage);
  }
  document.addEventListener("keydown", function (e) {
    if (!onScreen || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  });

  // load every page up front so a turn never shows a blank sheet
  srcs.forEach(function (s) { var im = new Image(); im.decoding = "async"; im.src = s; });

  fit();
  var rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(fit, 120); });
  window.addEventListener("load", fit);

  // for testing in the browser console
  window.leapBook = { next: next, prev: prev, get page() { return currentPage(); }, get mode() { return mode; }, get flipped() { return pos; } };
})();
