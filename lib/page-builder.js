/* ===========================================================================
   Page builder: pagina's en sjablonen uit Directus, klaar voor
   components/blocks/BlockRenderer.

   Twee soorten pagina's:

   - Builderpagina's met een eigen route (/hulp, /word-workshopgever,
     /locatie-gezocht). Staat er in Directus nog geen gepubliceerde versie,
     dan tonen we de startinhoud uit lib/page-templates.json.

   - Sjablonen voor bestaande routes (home, categorie, workshop, aanbieder,
     inloggen). Alleen een gepubliceerd sjabloon telt; zonder sjabloon
     rendert de route het vaste scherm zoals voorheen. In een sjabloon
     staat het vaste scherm als blok `page_core`.

   resolveBlocks() haalt per blok de data op die het nodig heeft
   (workshops, categorieën, plaatsen, reviews, ruimtes) en vult de
   placeholders {{category}}, {{city}}, {{workshop}} en {{provider}} in.
   =========================================================================== */

import {
  getBuilderPageRecord, mapContentBlock, getCategories,
  getBlockWorkshops, getBlockCities, getBlockReviews, getPublishedVenues,
} from "@/lib/directus";
import PAGE_TEMPLATES from "@/lib/page-templates.json";

const TEMPLATES = PAGE_TEMPLATES.templates;

const DEFAULT_LIMITS = { workshop_list: 6, city_grid: 4, review_list: 3, venue_list: 12, category_grid: 12 };

function fromTemplate(t) {
  return {
    slug: t.slug,
    title: t.title,
    page_type: t.page_type,
    seo_title: t.seo_title || "",
    seo_description: t.seo_description || "",
    hero_image: null,
    blocks: t.blocks.map((b, i) => mapContentBlock({ id: null, sort: i + 1, ...b })).filter(Boolean),
    directus: null,
  };
}

function interpolate(text, vars) {
  if (!text || typeof text !== "string" || !text.includes("{{")) return text;
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? "");
}

function interpolateBlock(block, vars) {
  const out = { ...block };
  for (const key of ["title", "body", "eyebrow", "cta_label", "cta_secondary_label"]) {
    out[key] = interpolate(out[key], vars);
  }
  return out;
}

/* ctx: { category, city, workshop, provider } zoals de route ze heeft. */
async function resolveBlock(block, ctx) {
  const limit = block.item_limit || DEFAULT_LIMITS[block.type];
  switch (block.type) {
    case "workshop_list": {
      const workshops = await getBlockWorkshops({
        source: block.source || "featured",
        limit,
        categoryId: block.filter_category,
        cityId: block.filter_city,
        ids: block.workshop_ids,
        context: {
          categoryId: ctx.category?.id,
          cityId: ctx.city?.id,
          providerSlug: ctx.provider?.slug,
          excludeId: ctx.workshop?.id,
        },
      });
      return { ...block, data: { workshops } };
    }
    case "category_grid": {
      const categories = (await getCategories()).slice(0, limit);
      return { ...block, data: { categories } };
    }
    case "city_grid":
      return { ...block, data: { cities: await getBlockCities(limit) } };
    case "review_list": {
      if (block.source === "manual") return block;
      const reviews = await getBlockReviews({
        limit,
        workshopSlug: block.source === "context" ? ctx.workshop?.slug : undefined,
        providerSlug: block.source === "context" ? ctx.provider?.slug : undefined,
      });
      return { ...block, data: { reviews } };
    }
    case "venue_list":
      if (block.source === "manual") return block;
      return { ...block, data: { venues: await getPublishedVenues(limit) } };
    default:
      return block;
  }
}

export async function resolveBlocks(blocks = [], ctx = {}) {
  const vars = {
    category: ctx.category?.name || "",
    city: ctx.city?.name || "",
    workshop: ctx.workshop?.title || "",
    provider: ctx.provider?.display_name || ctx.provider?.name || "",
  };
  return Promise.all(blocks.map((b) => resolveBlock(interpolateBlock(b, vars), ctx)));
}

/* Builderpagina met eigen route: Directus, anders de startinhoud. */
export async function loadBuilderPage(slug, ctx = {}) {
  const record = await getBuilderPageRecord({ slug });
  const template = TEMPLATES.find((t) => t.slug === slug);
  const page = record || (template ? fromTemplate(template) : null);
  if (!page) return null;
  return { ...page, blocks: await resolveBlocks(page.blocks, ctx) };
}

/* Sjabloon voor een bestaande route. null = geen gepubliceerd sjabloon,
   de route toont dan het vaste scherm. */
export async function loadPageTemplate(pageType, ctx = {}) {
  const record = await getBuilderPageRecord({ pageType });
  if (!record || !record.blocks.length) return null;
  return { ...record, blocks: await resolveBlocks(record.blocks, ctx) };
}

export function builderMetadata(page, fallback = {}) {
  if (!page) return fallback;
  const title = page.seo_title || page.title || fallback.title;
  const description = page.seo_description || fallback.description || "";
  return {
    title,
    description,
    openGraph: { title, description, ...(page.hero_image ? { images: [{ url: page.hero_image }] } : {}) },
  };
}
