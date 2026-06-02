/**
 * Sanity Studio osadzone w aplikacji pod /admin.
 * `metadata` z next-sanity/studio ustawia robots: 'noindex' — Studio nie
 * jest indeksowane (dodatkowo wykluczone w robots.ts).
 */
import { Studio } from "./Studio";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function AdminStudioPage() {
  return <Studio />;
}
