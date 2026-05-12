import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "./env";

/**
 * Read-only client used by Server Components.
 * The CDN flag gives free, fast caching; if you want preview/draft mode,
 * add a perspective: 'previewDrafts' instance with the read token.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
