/*
  MEDIA SLOTS — every spot on the site meant for a GIF, animation or video.
  -----------------------------------------------------------------------
  Put your file in assets/media/ and write its path next to the slot name.
  Leave a slot as "" and it shows a dashed placeholder with its name and size,
  so you can see where things go. (Delete a slot's whole <figure> from the
  HTML if you don't want it at all.)

  Works with .gif, .png, .webp, .jpg, .mp4 and .webm.
  Tip: export long animations as .mp4 (much smaller than GIF). Videos play
  muted, on loop, without controls, like a GIF.

  The size in each comment is the shape of the frame, not a hard rule.
*/
window.MEDIA = {
  // LOGO (every page)
  "logo-icon": "assets/img/logo-icon.png", // the square violet corner, e.g. your frog logo, transparent PNG/SVG 1:1 (400×400)
  "logo-wordmark": "assets/img/logo-wordmark.png", // the COSMICDROID lettering, transparent PNG/SVG, wide (e.g. 1200×240)

  // HOME
  "home-hero": "assets/img/hero.jpg",  // not used right now: the castle replaced the old homepage hero
  "service-murals": "",                // little icon/loop next to each service, 1:1 (120×120)
  "service-illustration": "",
  "service-branding": "",
  "service-animation": "",
  // the five room rows on the homepage: shown when you hover a row (a small animated frog, GIF/PNG/WebP).
  // Empty = the walking Leap Kill guy.
  "room-1": "",                        // 01 Library
  "room-2": "",                        // 02 Mural studio
  "room-3": "",                        // 03 Arcade
  "room-4": "",                        // 04 My room
  "room-5": "",                        // 05 Post room
  "leapkill-1": "assets/img/leapkill/01.jpg",   // Leap Kill box on the homepage, 4:5 (800×1000)
  "leapkill-2": "assets/img/leapkill/02.jpg",
  "leapkill-3": "assets/img/leapkill/03.jpg",

  // MURALS
  "murals-timelapse": "",              // a mural timelapse, 16:9 (.mp4)

  // WORK
  "work-loop-1": "",                   // three animated loops under the grid, 1:1 (800×800)
  "work-loop-2": "",
  "work-loop-3": "",

  // THE FROG
  "frog-hero": "assets/img/frog/frog.jpg", // the Frog himself, 4:5 arched (800×1000)
  "frog-icon": "",                     // small portrait in the Frog's card, 1:1 round (200×200)
  "ciruela-icon": "",                  // small portrait in Ciruela's card, 1:1 round (200×200)
  "frog-pages": "",                    // comic page preview or animatic, 3:4 (900×1200)

  // ABOUT
  "about-portrait": "assets/img/me.jpg", // your photo, 4:5 arched (800×1000)
  "about-studio": "",                  // studio / drumming / process loop, 16:9 (1280×720)

  // CONTACT
  "contact-critter": "",               // something waiting for your message, 1:1 (400×400)

  // EVERY PAGE
  "footer-critter": "assets/img/cosmiclaptop.png", // the friend in the footer (every page)

  // JUNO PROJECT PAGE
  "juno-timelapse": ""                 // painting timelapse, 16:9 (.mp4)
};
