import type { ShellData } from "./shell-data";

/* De voorbeelddata uit reference/pages/*.html (megamenu met aantallen en
   foto's). Alleen voor /dev/shell?fixture=ref, zodat de visuele test het
   ontwerp vergelijkt en niet de inhoud. */
const CATS: [string, string, string, number][] = [
  ["Koken & bakken", "koken-en-bakken", "koken", 412],
  ["Keramiek & klei", "keramiek-en-klei", "keramiek3", 286],
  ["Ambacht & maken", "ambacht-en-maken", "ambacht2", 231],
  ["Schilderen & kunst", "schilderen-en-kunst", "schilderen", 198],
  ["Drinks & proeverijen", "drinks-en-proeverijen", "drinks2", 174],
  ["Wellness & beauty", "wellness-en-beauty", "wellness", 158],
  ["Bloemen & groen", "bloemen-en-groen", "bloemen2", 143],
  ["Actief & buiten", "actief-en-buiten", "buiten2", 122],
  ["Dans, muziek & theater", "dans-muziek-en-theater", "dans", 96],
  ["Fotografie & media", "fotografie-en-media", "fotografie", 87],
  ["Niche & onverwacht", "niche-en-onverwacht", "niche2", 74],
  ["Duurzaam & repair", "duurzaam-en-repair", "repair", 41],
];

export const REFERENCE_SHELL: ShellData = {
  categories: CATS.map(([name, slug, img, count]) => ({ name, slug, image: `/dev/ref-img/${img}.jpg`, count })),
  occasions: [
    { name: "Date", slug: "date" }, { name: "Vrienden", slug: "vrienden" }, { name: "Teamuitje", slug: "teamuitje" },
    { name: "Vrijgezellenfeest", slug: "vrijgezellenfeest" }, { name: "Kinderfeestje", slug: "kinderfeestje" },
  ],
  places: [
    { name: "Amsterdam", slug: "amsterdam" }, { name: "Rotterdam", slug: "rotterdam" },
    { name: "Utrecht", slug: "utrecht" }, { name: "Den Haag", slug: "den-haag" },
  ],
  placeCount: 187,
  announce: null,
};
