"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { FEATURED, ARTICLES } from "@/lib/mock-data";

/* ===========================================================================
   useGo — brug tussen de prototype-navigatie en echte Next.js-routes.

   De pagina-componenten uit het prototype werken met een functie `go(r)`
   waarbij `r` een route-object is, bijvoorbeeld:
     go({ name: "workshop", workshop: w })
     go({ name: "listing", category: c })
     go({ name: "auth", tab: "provider" })

   Deze hook geeft zo'n functie terug, maar zet het route-object om in een
   echte URL en navigeert via de Next.js-router. Zo kunnen de componenten
   ongewijzigd blijven, terwijl elke pagina zijn eigen URL krijgt.

   Zodra de componenten worden opgesplitst naar next/link, kan deze hook
   weg. Tot die tijd is het de minst ingrijpende manier om echte routes te
   krijgen zonder 60+ aanroepen te herschrijven.
   =========================================================================== */

const DEFAULT_WORKSHOP_SLUG = FEATURED[0].slug;
const DEFAULT_ARTICLE_SLUG = ARTICLES[0].slug;

export function useGo() {
  const router = useRouter();

  return useCallback(
    (r) => {
      if (!r || !r.name) return;
      let url = "/";
      switch (r.name) {
        case "home":
          url = "/";
          break;
        case "listing":
          url = r.category && r.category.slug ? `/categorie/${r.category.slug}` : "/zoeken";
          break;
        case "workshop":
          url = `/workshop/${(r.workshop && r.workshop.slug) || DEFAULT_WORKSHOP_SLUG}`;
          break;
        case "provider":
          url = `/aanbieder/${r.slug || "marco-rossi"}`;
          break;
        case "blog":
          url = "/inspiratie";
          break;
        case "business":
          url = "/bedrijven";
          break;
        case "giftcard":
          url = "/cadeaubon";
          break;
        case "article":
          url = `/inspiratie/${(r.article && r.article.slug) || DEFAULT_ARTICLE_SLUG}`;
          break;
        case "auth":
          url = r.tab === "provider" ? "/inloggen?tab=provider" : "/inloggen";
          break;
        case "signup":
          url = "/dashboard/profiel";
          break;
        case "wizard":
          url = "/dashboard/workshops/nieuw";
          break;
        case "dashboard":
          url = "/dashboard";
          break;
        default:
          url = "/";
      }
      router.push(url);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
    },
    [router]
  );
}
