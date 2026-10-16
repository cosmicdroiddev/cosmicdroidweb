/*
  PROJECT LIST
  ------------
  This is the only file you edit to add, remove or reorder projects.
  Each entry becomes a card on the Home, Murals or Work page.

  type      "mural" shows on Murals, "work" shows on Work
  featured  true = also shows on the homepage (keep it to about 6)
  page      path to the project's own page, or null if it doesn't have one yet
  cover     square-ish cover image in assets/img/<slug>/

  Entries marked CHECK came from the old site; confirm the year, location and tag.
*/
window.PROJECTS = [
  { slug: "all-the-cores", title: "All the Cores and More", type: "work", tag: "Merch design", year: "2026", cover: "assets/img/all-the-cores/cover.webp", page: "projects/all-the-cores.html", featured: true },   // CHECK year
  { slug: "no-known-weakness", title: "No Known Weakness", type: "work", tag: "Album art", year: "2026", cover: "assets/img/no-known-weakness/cover.webp", page: "projects/no-known-weakness.html", featured: true },   // CHECK year
  { slug: "imprint-rolling", title: "Imprint Rolling", type: "work", tag: "Branding, illustration", year: "2026", cover: "assets/img/imprint-rolling/cover.webp", page: "projects/imprint-rolling.html" },   // CHECK year
  { slug: "terp-wizard-lab", title: "Terp Wizard: the lab", type: "work", tag: "Merch design", year: "2026", cover: "assets/img/terp-wizard-lab/cover.webp", page: "projects/terp-wizard-lab.html" },   // CHECK year
  { slug: "juno-mural", title: "Juno mural", type: "mural", tag: "Mural", location: "Villach, Austria", year: "2024", cover: "assets/img/juno-mural/cover.webp", page: "projects/juno-mural.html", featured: true },
  { slug: "cannabicultores", title: "Cannabicultores", type: "work", tag: "Festival poster", location: "Manizales, Colombia", year: "2024", cover: "assets/img/cannabicultores/cover.webp", page: "projects/cannabicultores.html" },
  { slug: "borea", title: "Borea", type: "work", tag: "Packaging", year: "2024", cover: "assets/img/borea/cover.webp", page: "projects/borea.html" },   // CHECK year
  { slug: "sluggore", title: "Sluggore", type: "work", tag: "Band merch", year: "2024", cover: "assets/img/sluggore/cover.webp", page: "projects/sluggore.html" },   // CHECK year
  { slug: "coffee-shop-mural", title: "Coffee shop mural", type: "mural", tag: "Mural", year: "2024", cover: "assets/img/coffee-shop-mural/cover.jpg", page: null, featured: true },   // CHECK location
  { slug: "jfgprintco", title: "JFGprintco", type: "work", tag: "Illustration", year: "2025", cover: "assets/img/jfgprintco/cover.jpg", page: null },   // CHECK
  { slug: "organico", title: "Orgánico", type: "work", tag: "Shirt design", year: "2023", cover: "assets/img/organico/cover.webp", page: "projects/organico.html" },   // CHECK year
  { slug: "big-cats-collection", title: "Big cats collection", type: "work", tag: "Illustration series", year: "2023", cover: "assets/img/big-cats-collection/cover.webp", page: "projects/big-cats-collection.html", featured: true },   // CHECK year
  { slug: "brutal-burger-quest", title: "Brutal Burger Quest", type: "work", tag: "Game art", year: "2023", cover: "assets/img/brutal-burger-quest/cover.webp", page: "projects/brutal-burger-quest.html" },   // CHECK year
  { slug: "cage-of-destiny", title: "Cage of Destiny", type: "work", tag: "Game jam", year: "2023", cover: "assets/img/cage-of-destiny/cover.webp", page: "projects/cage-of-destiny.html" },   // CHECK year
  { slug: "terp-wizard", title: "Terp Wizard: the cauldron", type: "work", tag: "Merch design", year: "2023", cover: "assets/img/terp-wizard/cover.webp", page: "projects/terp-wizard.html", featured: true },   // CHECK year
  { slug: "botanica-mural", title: "Botánica mural", type: "mural", tag: "Mural", year: "2022", cover: "assets/img/botanica-mural/cover.webp", page: "projects/botanica-mural.html" },   // CHECK name, place and year
  { slug: "pizzaneta", title: "Pizzaneta", type: "work", tag: "Branding, merch", year: "2022", cover: "assets/img/pizzaneta/cover.webp", page: "projects/pizzaneta.html" },   // CHECK year
  { slug: "cosmic-realms", title: "Cosmic realms", type: "work", tag: "Illustration", year: "2024", cover: "assets/img/cosmic-realms/cover.jpg", page: null },   // CHECK
  { slug: "gamehendge", title: "Gamehendge", type: "work", tag: "Illustration", year: "2024", cover: "assets/img/gamehendge/cover.jpg", page: null }   // CHECK
];
