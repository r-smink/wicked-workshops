/* Tijdelijk stockbeeld uit het ontwerp (wicked-handoff/design/img, Pexels).
   Alleen als terugval zolang Directus geen eigen foto heeft. Voor livegang
   vervangen door beeld van aanbieders (zie wicked-handoff/docs/beeldmap.md). */

const CATEGORY: Record<string, string> = {
  "koken-en-bakken": "/img/koken.jpg",
  "keramiek-en-klei": "/img/keramiek3.jpg",
  "ambacht-en-maken": "/img/ambacht2.jpg",
  "schilderen-en-kunst": "/img/schilderen.jpg",
  "drinks-en-proeverijen": "/img/drinks2.jpg",
  "wellness-en-beauty": "/img/wellness.jpg",
  "bloemen-en-groen": "/img/bloemen2.jpg",
  "actief-en-buiten": "/img/buiten2.jpg",
  "dans-muziek-en-theater": "/img/dans.jpg",
  "fotografie-en-media": "/img/fotografie.jpg",
  "niche-en-onverwacht": "/img/niche2.jpg",
  "duurzaam-en-repair": "/img/repair.jpg",
};

const CITY: Record<string, string> = {
  amsterdam: "/img/amsterdam.jpg",
  rotterdam: "/img/rotterdam.jpg",
  utrecht: "/img/utrecht.jpg",
  "den-haag": "/img/denhaag.jpg",
};

/* Per workshop-slug het beeld uit het ontwerp; anders dat van de categorie. */
const WORKSHOP: Record<string, string> = {
  "italiaans-koken-met-luca-verse-pasta": "/img/cat-pasta.jpg",
  "ravioli-vullen-en-vouwen": "/img/cat-ravioli.jpg",
  "koken-met-wijn-ossobuco-en-risotto": "/img/cat-wijn2.jpg",
  "dumplings-vouwen-en-stomen": "/img/cat-dumpling.jpg",
  "sushi-rollen-voor-beginners": "/img/cat-sushi.jpg",
  "handvormen-voor-beginners": "/img/keramiek2.jpg",
  "kaarsen-gieten-van-sojawas-in-hattem": "/img/kaarsen2.jpg",
};

const PROVIDER: Record<string, string> = {
  luca: "/img/aanbieder-luca.jpg",
};

export const categoryImage = (slug: string | null | undefined): string | null => (slug && CATEGORY[slug]) || null;
export const cityImage = (slug: string | null | undefined): string | null => (slug && CITY[slug]) || null;
export const providerImage = (slug: string | null | undefined): string | null => (slug && PROVIDER[slug]) || null;
export function workshopImage(slug: string | null | undefined, categorySlug?: string | null): string {
  return (slug && WORKSHOP[slug]) || categoryImage(categorySlug) || "/img/koken.jpg";
}
