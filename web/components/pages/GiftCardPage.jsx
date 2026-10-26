"use client";

import StaticPage from "@/components/pages/StaticPage";
import { GIFTCARD_PAGE } from "@/lib/mock-data";

/* Cadeaubon-pagina. Rendert de gedeende StaticPage met content uit
   Directus (via de `page` prop) of de mock-data fallback. */
export default function GiftCardPage({ page = GIFTCARD_PAGE }) {
  return <StaticPage page={page} />;
}
