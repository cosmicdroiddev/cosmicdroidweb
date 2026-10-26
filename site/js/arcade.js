/*
  ARCADE: plays the Leap Kill videogame in a full-screen window
  --------------------------------------------------------------
  The game itself lives in games/leapkill/ (a GDevelop export; see tools/game/README.md).
  It opens from the castle TV, the "Arcade" link on the home page, the Play button
  on the Leap Kill page, and any link ending in #play.

  Desktop: arrows move, Space jumps, X shoots.
  Phones: play sideways (landscape) with the on-screen stick and button.
*/
(function () {
  var base = document.body.getAttribute("data-base") || "";
  var SRC = base + "games/leapkill/index.html";

  var box = document.createElement("div");
  box.className = "arcade";
  box.id = "arcade";
  box.hidden = true;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Leap Kill, the videogame");
  box.innerHTML =
    '<div class="arcade-stage">' +
      '<div class="arcade-screen"></div>' +
      '<p class="arcade-keys"><b>Leap Kill</b> &nbsp;← → move · space jump · X shoot</p>' +
    "</div>" +
    '<div class="arcade-tools">' +
      '<button type="button" class="arcade-btn" data-arcade="restart" aria-label="Restart the game" title="Restart">↻</button>' +
      '<button type="button" class="arcade-btn" data-arcade="close" aria-label="Close the game" title="Close">✕</button>' +
    "</div>" +
    '<div class="arcade-rotate" aria-live="polite">' +
      '<div class="arcade-rotate-card">' +
        '<span class="arcade-rotate-phone" aria-hidden="true"></span>' +
        "<p>Turn your phone sideways to play</p>" +
        '<button type="button" class="arcade-btn arcade-rotate-close" data-arcade="close">back to the castle</button>' +
      "</div>" +
    "</div>";
  document.body.appendChild(box);

  var screen = box.querySelector(".arcade-screen");
  var frame = null;
  var lastFocus = null;

  function load() {
    if (frame) frame.remove();
    frame = document.createElement("iframe");
    frame.className = "arcade-frame";
    frame.title = "Leap Kill, the videogame";
    frame.setAttribute("allow", "autoplay; fullscreen; gamepad");
    frame.src = SRC;
    frame.addEventListener("load", function () {
      try {
        frame.contentWindow.focus();
        // Esc closes the game even while it has the keyboard
        frame.contentWindow.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      } catch (e) {}
    });
    screen.appendChild(frame);
  }

  function open() {
    if (!box.hidden) return;
    lastFocus = document.activeElement;
    box.hidden = false;
    document.documentElement.classList.add("arcade-open");
    load();
    setTimeout(function () { if (frame) frame.focus(); }, 50);
  }

  function close() {
    if (box.hidden) return;
    box.hidden = true;
    document.documentElement.classList.remove("arcade-open");
    // removing the frame stops the music and the game loop
    if (frame) { frame.remove(); frame = null; }
    if (location.hash === "#play") history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  box.addEventListener("click", function (e) {
    var b = e.target.closest("[data-arcade]");
    if (!b) return;
    if (b.getAttribute("data-arcade") === "close") close();
    else load();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !box.hidden) close();
  });

  // links and buttons that open the game
  document.querySelectorAll("[data-play-game]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); open(); });
  });
  if (location.hash === "#play") open();

  window.arcade = { open: open, close: close };
})();
