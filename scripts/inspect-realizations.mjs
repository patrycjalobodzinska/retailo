import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]])
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "hl9im7uq",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: "2024-10-01",
  useCdn: false,
});

const langs = await client.fetch(`*[_type=="language"]{_id, code}`);
const codeById = Object.fromEntries(langs.map((l) => [l._id, l.code]));

const byCode = (loc) => {
  const out = {};
  for (const t of loc?.translations ?? []) {
    const code = codeById[t?.language?._ref] ?? t?.language?._ref ?? "?";
    out[code] = t?.value;
  }
  return out;
};

const rs = await client.fetch(`*[_type=="realization"]{
  _id, "slug": slug.current, title, location, summary,
  specs[]{label, value}
}`);

for (const r of rs) {
  console.log("\n=== " + r.slug + "  (" + r._id + ")");
  console.log("  title:   ", JSON.stringify(byCode(r.title)));
  console.log("  location:", JSON.stringify(byCode(r.location)));
  console.log("  summary: ", JSON.stringify(byCode(r.summary)));
  (r.specs ?? []).forEach((s, i) => {
    console.log(
      `  spec[${i}]: label=${JSON.stringify(byCode(s.label))}  value=${JSON.stringify(byCode(s.value))}`,
    );
  });
}
console.log("\nlanguages:", JSON.stringify(codeById));
