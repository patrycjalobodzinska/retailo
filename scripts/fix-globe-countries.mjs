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

// Finalna lista krajów (po usunięciu Francji, Wielkiej Brytanii, Rumunii,
// Austrii, Słowacji, Holandii; dodaniu Turcji i Danii).
const LEFT = [
  { pl: "Polska", en: "Poland", iso: "PL" },
  { pl: "Niemcy", en: "Germany", iso: "DE" },
  { pl: "Hiszpania", en: "Spain", iso: "ES" },
  { pl: "Włochy", en: "Italy", iso: "IT" },
];
const RIGHT = [
  { pl: "Czechy", en: "Czechia", iso: "CZ" },
  { pl: "Szwecja", en: "Sweden", iso: "SE" },
  { pl: "Dania", en: "Denmark", iso: "DK" },
  { pl: "Turcja", en: "Turkey", iso: "TR" },
];

const locString = (pl, en, key) => ({
  _key: key,
  _type: "localizedString",
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

const col = (arr, side) => arr.map((c, i) => locString(c.pl, c.en, `${side}${i}`));
const iso = [...LEFT, ...RIGHT].map((c) => c.iso);

for (const id of ["homeGlobal", "drafts.homeGlobal"]) {
  const exists = await client.fetch(`*[_id==$id][0]._id`, { id });
  if (!exists) {
    console.log(`— ${id}: brak, pomijam`);
    continue;
  }
  await client
    .patch(id)
    .set({
      globalCountriesLeft: col(LEFT, "l"),
      globalCountriesRight: col(RIGHT, "r"),
      globalMapCountries: iso,
    })
    .commit();
  console.log(`✓ ${id}: ${iso.join(", ")}`);
}

console.log("\nDone.");
