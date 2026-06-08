import type { MetadataRoute } from "next";

const BASE_URL = "https://retailo.pl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    host: BASE_URL,
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
