import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId, writeToken } from "./env";

/**
 * Read-only client used by Server Components.
 * Token jest dołączany jeśli dostępny — pozwala czytać też z prywatnych
 * datasets (Editor token i tak ma `read+write`). Bez tokenu client działa
 * tylko z publicznym datasetem.
 * CDN flag = free, fast caching. Dla preview/draft mode użyj osobnego
 * klienta z `perspective: 'previewDrafts'`.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  token: writeToken || undefined,
});
