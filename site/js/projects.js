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
  {
    slug: "all-the-cores",
    title: "All the Cores and More",
    type: "work",
    tag: "Merch design",
    location: "",
    year: "2026",          // CHECK year
    cover: "assets/img/all-the-cores/cover.webp",
    page: "projects/all-the-cores.html",
    featured: true
  },
  {
    slug: "juno-mural",
    title: "Juno mural",
    type: "mural",
    tag: "Mural",
    location: "Villach, Austria",
    year: "2024",
    cover: "assets/img/juno-mural/cover.webp",
    page: "projects/juno-mural.html",
    featured: true
  },
  {
    slug: "coffee-shop-mural",
    title: "Coffee shop mural",
    type: "mural",
    tag: "Mural",          // CHECK location
    location: "",
    year: "2024",
    cover: "assets/img/coffee-shop-mural/cover.jpg",
    page: null,
    featured: true
  },
  {
    slug: "pizzaneta",
    title: "Pizzaneta",
    type: "work",
    tag: "Branding, illustration",
    year: "2024",
    cover: "assets/img/pizzaneta/cover.jpg",
    page: null,
    featured: true
  },
  {
    slug: "terp-wizard",
    title: "Terp Wizard",
    type: "work",
    tag: "Character, branding",
    year: "2024",
    cover: "assets/img/terp-wizard/cover.jpg",
    page: null,
    featured: true
  },
  {
    slug: "jfgprintco",
    title: "JFGprintco",
    type: "work",
    tag: "Illustration",   // CHECK
    year: "2025",
    cover: "assets/img/jfgprintco/cover.jpg",
    page: null,
    featured: true
  },
  {
    slug: "big-cats-collection",
    title: "Big cats collection",
    type: "work",
    tag: "Illustration series",
    year: "2024",
    cover: "assets/img/big-cats-collection/cover.jpg",
    page: null,
    featured: true
  },
  { slug: "cosmic-realms", title: "Cosmic realms", type: "work", tag: "Illustration", year: "2024", cover: "assets/img/cosmic-realms/cover.jpg", page: null },          // CHECK
  { slug: "organico", title: "Orgánico", type: "work", tag: "Illustration", year: "2024", cover: "assets/img/organico/cover.jpg", page: null },                         // CHECK
  { slug: "brutal-burger-quest", title: "Brutal Burger Quest", type: "work", tag: "Illustration", year: "2024", cover: "assets/img/brutal-burger-quest/cover.jpg", page: null }, // CHECK
  { slug: "cannabicultores", title: "Cannabicultores", type: "work", tag: "Illustration", year: "2024", cover: "assets/img/cannabicultores/cover.jpg", page: null },   // CHECK
  { slug: "borea", title: "Borea", type: "work", tag: "Illustration", year: "2024", cover: "assets/img/borea/cover.jpg", page: null },                                  // CHECK
  { slug: "sluggore", title: "Sluggore", type: "work", tag: "Illustration", year: "2024", cover: "assets/img/sluggore/cover.jpg", page: null },                         // CHECK
  { slug: "cage-of-destiny", title: "Cage of Destiny", type: "work", tag: "Illustration", year: "2024", cover: "assets/img/cage-of-destiny/cover.jpg", page: null },    // CHECK
  { slug: "gamehendge", title: "Gamehendge", type: "work", tag: "Illustration", year: "2024", cover: "assets/img/gamehendge/cover.jpg", page: null }                    // CHECK
];
