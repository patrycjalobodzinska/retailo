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
const langOf = (t) => codeById[t?.language?._ref] ?? t?.language?._ref;

// Wspólny człon opisu + przymiotnik per model.
const SUFFIX_PL =
  "konfiguracja PickUpWall dla sklepów o dużym ruchu, zoptymalizowana pod paczki o różnych wymiarach.";
const SUFFIX_EN =
  "PickUpWall configuration for high-traffic stores, optimised for parcels of various sizes.";

// Dopasowanie po nazwie modelu (zawiera " M"/" L"/" XL").
const DESC = [
  { match: /\bM\b/, pl: `Kompaktowa ${SUFFIX_PL}`, en: `Compact ${SUFFIX_EN}` },
  { match: /\bL\b/, pl: `Standardowa ${SUFFIX_PL}`, en: `Standard ${SUFFIX_EN}` },
  { match: /\bXL\b/, pl: `Rozszerzona ${SUFFIX_PL}`, en: `Extended ${SUFFIX_EN}` },
];

const pickDesc = (name) => {
  // XL przed L/M (żeby "XL" nie wpadło w \bL\b — \b nie złapie, ale dla pewności).
  if (/\bXL\b/.test(name)) return DESC[2];
  if (/\bL\b/.test(name)) return DESC[1];
  if (/\bM\b/.test(name)) return DESC[0];
  return null;
};

const locDesc = (pl, en) => ({
  _type: "localizedText",
  translations: [
    {
      _key: "pl",
      _type: "translation",
      language: { _type: "reference", _ref: "language-pl" },
      value: pl,
    },
    {
      _key: "en",
      _type: "translation",
      language: { _type: "reference", _ref: "language-en" },
      value: en,
    },
  ],
});

for (const id of ["homePage", "drafts.homePage"]) {
  const doc = await client.fetch(`*[_id==$id][0]{ _id, models }`, { id });
  if (!doc?._id) {
    console.log(`— ${id}: brak dokumentu`);
    continue;
  }
  const models = doc.models ?? [];
  if (!models.length) {
    console.log(`— ${id}: brak modeli`);
    continue;
  }
  let changed = false;
  for (const m of models) {
    const name = (m.name?.translations ?? []).find((t) => langOf(t) === "pl")
      ?.value ?? "";
    const d = pickDesc(name);
    if (!d) {
      console.log(`   ⚠ ${id}: nie rozpoznano modelu "${name}"`);
      continue;
    }
    m.description = locDesc(d.pl, d.en);
    changed = true;
    console.log(`   ${id}: ${name} → ${d.pl.split(" ")[0]}`);
  }
  if (changed) {
    await client.patch(id).set({ models }).commit();
    console.log(`✓ ${id}`);
  }
}

console.log("\nDone.");
