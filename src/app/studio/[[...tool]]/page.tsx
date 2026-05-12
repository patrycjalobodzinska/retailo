/**
 * Sanity Studio mounted under /studio.
 * Editors visit /studio to manage all content. No deploy needed for new
 * content / new languages — they all happen at runtime via the CMS.
 *
 * This file is a server component so it can re-export `metadata` and
 * `viewport` from `next-sanity/studio`. The actual studio UI lives in
 * the client component `./Studio`.
 */
import Studio from "./Studio";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <Studio />;
}
