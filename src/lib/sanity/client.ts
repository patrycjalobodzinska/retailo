import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId, writeToken } from "./env";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  token: writeToken || undefined,
});
