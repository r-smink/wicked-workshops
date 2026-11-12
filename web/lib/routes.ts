/* Routes van de voorkant (wicked-handoff/PROMPT-BOUW.md, stap 3). Eén plek,
   zodat links overal hetzelfde zijn. "nederland" staat voor alle plaatsen. */

export const ALL_PLACES = "nederland";

export const routes = {
  home: "/",
  workshop: (slug: string) => `/workshops/${slug}`,
  provider: (slug: string) => `/aanbieders/${slug}`,
  category: (categorySlug: string, placeSlug: string = ALL_PLACES) => `/${placeSlug}/${categorySlug}`,
  place: (placeSlug: string) => `/${placeSlug}/alles`,
  giver: "/workshops-geven",
  room: "/ruimte-gezocht",
  help: "/hulp",
  contact: "/contact",
  login: "/inloggen",
} as const;

/* Categorie "alles": alle categorieen in een plaats. */
export const ALL_CATEGORIES = "alles";
