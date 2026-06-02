import type { MetadataRoute } from "next";

const BASE_URL = "https://retailo.pl";

// Wyklucza panel Studio (/admin) z indeksowania przez roboty.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    host: BASE_URL,
  };
}
