import { Studio } from "./Studio";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ tool: [] }];
}

export { metadata, viewport } from "next-sanity/studio";

export default function AdminStudioPage() {
  return <Studio />;
}
