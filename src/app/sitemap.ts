import type { MetadataRoute } from "next";
import { getRealizationsList } from "@/lib/sanity/fetch";

const BASE_URL = "https://retailo.pl";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let realizations: Awaited<ReturnType<typeof getRealizationsList>> = [];
  try {
    realizations = await getRealizationsList();
  } catch {
    realizations = [];
  }

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: `${BASE_URL}/realizacje`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/polityka-prywatnosci`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const realizationRoutes: MetadataRoute.Sitemap = realizations.map((r) => ({
    url: `${BASE_URL}/realizacje/${r.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...realizationRoutes];
}
