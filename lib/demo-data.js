import { ARTICLES, CATEGORIES, FEATURED, LISTING } from "@/lib/mock-data";

const asset = (name) => `/demo/${name}.jpg`;

const CATEGORY_IMAGES = {
  "koken-en-bakken": asset("koken"),
  "keramiek-en-klei": asset("keramiek"),
  "schilderen-en-kunst": asset("schilderen"),
  "drinks-en-proeverijen": asset("drinks"),
  "bloemen-en-groen": asset("bloemen"),
  "ambacht-en-maken": asset("ambacht"),
  "fotografie-en-media": asset("fotografie"),
  "dans-muziek-en-theater": asset("dans"),
  "wellness-en-beauty": asset("wellness"),
  "actief-en-buiten": asset("buiten"),
  "niche-en-onverwacht": asset("niche"),
  "duurzaam-en-repair": asset("repair"),
};

const WORKSHOP_IMAGES = ["koken2", "keramiek2", "cocktail", "bloemen2", "koken3", "ambacht2"];
const ARTICLE_IMAGES = ["koken3", "buiten2", "samen", "koken2", "groep", "keramiek3", "drinks2", "bloemen2", "ambacht2"];

export const DEMO_CATEGORIES = CATEGORIES.map((category) => ({
  ...category,
  count: {
    "koken-en-bakken": "386+",
    "keramiek-en-klei": "248+",
    "schilderen-en-kunst": "221+",
    "drinks-en-proeverijen": "196+",
  }[category.slug] || category.count,
  image: CATEGORY_IMAGES[category.slug],
}));

export const DEMO_FEATURED = FEATURED.map((workshop, index) => ({
  ...workshop,
  image: asset(WORKSHOP_IMAGES[index] || WORKSHOP_IMAGES[index % WORKSHOP_IMAGES.length]),
  imageAlt: `${workshop.title}, tijdelijk conceptbeeld`,
}));

export const DEMO_LISTING = LISTING.map((workshop, index) => ({
  ...workshop,
  image: asset(WORKSHOP_IMAGES[index % WORKSHOP_IMAGES.length]),
  imageAlt: `${workshop.title}, tijdelijk conceptbeeld`,
}));

export const DEMO_ARTICLES = ARTICLES.map((article, index) => ({
  ...article,
  image: asset(ARTICLE_IMAGES[index % ARTICLE_IMAGES.length]),
  hero: asset(ARTICLE_IMAGES[index % ARTICLE_IMAGES.length]),
  imageAlt: `${article.title}, tijdelijk conceptbeeld`,
}));

export const DEMO_IMAGES = {
  hero: asset("samen"),
  provider: asset("koken2"),
  business: asset("groep"),
  gift: asset("ambacht2"),
  nationwide: asset("buiten"),
  article: asset("koken3"),
  cities: {
    Amsterdam: asset("amsterdam"),
    Utrecht: asset("utrecht"),
    Rotterdam: asset("rotterdam"),
    "Den Haag": asset("denhaag"),
  },
};

export function withDemoImage(record, fallback) {
  if (!record) return record;
  return { ...record, image: record.image || fallback, imageAlt: record.imageAlt || record.title || record.name || "Demo beeld" };
}
