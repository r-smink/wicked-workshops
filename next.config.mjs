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

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
