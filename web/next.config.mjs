/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Beeld komt straks uit Directus. Vul hier je eigen domein in zodra
  // next/image de foto's gaat serveren in plaats van de placeholders.
  images: {
    remotePatterns: [
      // { protocol: "https", hostname: "cms.wickedworkshops.nl", pathname: "/assets/**" },
    ],
  },

  /* Oude routes van de eerdere voorkant naar de routes uit
     wicked-handoff/PROMPT-BOUW.md. */
  async redirects() {
    return [
      { source: "/workshop/:slug", destination: "/workshops/:slug", permanent: true },
      { source: "/aanbieder/:slug", destination: "/aanbieders/:slug", permanent: true },
      { source: "/word-workshopgever", destination: "/workshops-geven", permanent: true },
      { source: "/locatie-gezocht", destination: "/ruimte-gezocht", permanent: true },
      { source: "/categorie/:category/:city", destination: "/:city/:category", permanent: true },
      { source: "/categorie/:category", destination: "/nederland/:category", permanent: true },
    ];
  },

  async headers() {
    /* frame-ancestors bepaalt wie de site in een iframe mag laden. Het
       Directus-domein staat erbij voor de Visual Editor, die de site in
       een iframe toont. Verder mag niemand iframen — zelfde bescherming
       als X-Frame-Options: SAMEORIGIN, maar dan per domein instelbaar. */
    const directusOrigin = (() => {
      try {
        return new URL(process.env.DIRECTUS_URL || "").origin;
      } catch {
        return null;
      }
    })();
    const frameAncestors = ["'self'", directusOrigin].filter(Boolean).join(" ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: `frame-ancestors ${frameAncestors}` },
        ],
      },
    ];
  },
};

export default nextConfig;
