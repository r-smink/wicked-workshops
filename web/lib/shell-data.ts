import "server-only";

/* Data voor de gedeelde shell: megamenu (categorieen, gelegenheden,
   plaatsen) en de aankondigingsbalk. Server-side, gecachet en via de tag
   "shell" te revalideren. Zonder Directus valt alles terug op de waarden
   uit het ontwerp, zodat de shell altijd compleet is.

   Tijdelijk met fetch; in fase 1 komt dit op de getypte client in
   lib/directus/. */

export type MenuCategory = { name: string; slug: string; image: string | null; count: number | null };
export type MenuLink = { name: string; slug: string };
export type ShellData = {
  categories: MenuCategory[];
  occasions: MenuLink[];
  places: MenuLink[];
  placeCount: number | null;
  announce: { highlight: string; text: string; href: string | null } | null;
};

const DIRECTUS_URL = (process.env.DIRECTUS_URL || "").replace(/\/$/, "");
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN || "";

/* Cadeau en Familie zijn niet bevestigd (docs/03, docs/12): niet tonen. */
const HIDDEN_OCCASIONS = new Set(["cadeau", "familie"]);

export const FALLBACK_SHELL: ShellData = {
  categories: [
    ["Koken & bakken", "koken-en-bakken"], ["Keramiek & klei", "keramiek-en-klei"], ["Ambacht & maken", "ambacht-en-maken"],
    ["Schilderen & kunst", "schilderen-en-kunst"], ["Drinks & proeverijen", "drinks-en-proeverijen"], ["Wellness & beauty", "wellness-en-beauty"],
    ["Bloemen & groen", "bloemen-en-groen"], ["Actief & buiten", "actief-en-buiten"], ["Dans, muziek & theater", "dans-muziek-en-theater"],
    ["Fotografie & media", "fotografie-en-media"], ["Niche & onverwacht", "niche-en-onverwacht"], ["Duurzaam & repair", "duurzaam-en-repair"],
  ].map(([name, slug]) => ({ name: name!, slug: slug!, image: null, count: null })),
  occasions: [
    { name: "Date", slug: "date" }, { name: "Vrienden", slug: "vrienden" }, { name: "Teamuitje", slug: "teamuitje" },
    { name: "Vrijgezellenfeest", slug: "vrijgezellenfeest" }, { name: "Kinderfeestje", slug: "kinderfeestje" },
  ],
  places: [
    { name: "Amsterdam", slug: "amsterdam" }, { name: "Rotterdam", slug: "rotterdam" },
    { name: "Utrecht", slug: "utrecht" }, { name: "Den Haag", slug: "den-haag" },
  ],
  placeCount: null,
  announce: null,
};

async function get<T>(path: string): Promise<T | null> {
  if (!DIRECTUS_URL) return null;
  try {
    const res = await fetch(`${DIRECTUS_URL}${path}`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      next: { revalidate: 300, tags: ["shell"] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

type RawCategory = { name: string; slug: string; image: string | null; workshop_count: number | null };
export type RawLink = { name: string; slug: string };
type RawCount = { count: { id: string | number } };
export type RawSettings = { announcement_bar?: string | null; announcement_highlight?: string | null; announcement_link?: string | null };

export async function getShellData(): Promise<ShellData> {
  const [cats, occ, places, placeCount, settings] = await Promise.all([
    get<RawCategory[]>("/items/categories?filter[status][_eq]=published&filter[parent][_null]=true&sort=sort,name&fields=name,slug,image,workshop_count&limit=12"),
    get<RawLink[]>("/items/occasions?sort=sort&fields=name,slug&limit=20"),
    get<RawLink[]>("/items/cities?filter[status][_eq]=published&sort=-is_top,sort,name&fields=name,slug&limit=4"),
    get<RawCount[]>("/items/cities?filter[status][_eq]=published&aggregate[count]=id"),
    get<RawSettings>("/items/settings?fields=announcement_bar,announcement_highlight,announcement_link"),
  ]);

  const categories = cats?.length
    ? cats.map((c) => ({
        name: c.name,
        slug: c.slug,
        image: c.image ? `/api/proxy/${c.image}?w=84&h=84` : null,
        count: c.workshop_count ?? null,
      }))
    : FALLBACK_SHELL.categories;

  const occasions = visibleOccasions(occ);

  const total = Number(placeCount?.[0]?.count?.id ?? NaN);

  return {
    categories,
    occasions,
    places: places?.length ? places : FALLBACK_SHELL.places,
    placeCount: Number.isFinite(total) ? total : null,
    announce: toAnnounce(settings),
  };
}

/* Cadeau en Familie vallen weg; zonder data de lijst uit het ontwerp. */
export function visibleOccasions(occ: RawLink[] | null): MenuLink[] {
  return occ?.length ? occ.filter((o) => !HIDDEN_OCCASIONS.has(o.slug)) : FALLBACK_SHELL.occasions;
}

/* Directus > settings: announcement_highlight is het vette deel,
   announcement_bar de tekst erna (valt op mobiel weg). Leeg = de tekst uit
   het ontwerp (null). */
export function toAnnounce(settings: RawSettings | null): ShellData["announce"] {
  const bar = settings?.announcement_bar?.trim() || "";
  const hl = settings?.announcement_highlight?.trim() || "";
  if (!bar && !hl) return null;
  const href = settings?.announcement_link || null;
  return hl ? { highlight: hl, text: bar, href } : { highlight: bar, text: "", href };
}
