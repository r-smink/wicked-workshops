import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/voorkant/seo";

/* Zolang SITE_INDEXABLE niet "1" is (pilot met voorbeelddata) mag niemand
   indexeren; gelijk aan robots in app/layout.tsx. */
export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.SITE_INDEXABLE === "1";
  return {
    rules: indexable
      ? [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/boeking/", "/account-maken", "/wachtwoord-", "/dev/"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
