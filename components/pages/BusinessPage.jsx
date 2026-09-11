"use client";

import StaticPage from "@/components/pages/StaticPage";
import { BUSINESS_PAGE } from "@/lib/mock-data";

/* Bedrijven-pagina. Rendert de gedeende StaticPage met content uit
   Directus (via de `page` prop) of de mock-data fallback. */
export default function BusinessPage({ page = BUSINESS_PAGE }) {
  return <StaticPage page={page} />;
}
