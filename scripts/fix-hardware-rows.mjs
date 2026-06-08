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

// localizedString {pl, en}
const loc = (pl, en) => ({
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

const ROWS = [
  ["hw1", loc("Liczba skrytek", "Locker count"), loc("od 3 do 320", "from 3 to 320")],
  ["hw2", loc("Ekran", "Screen"), loc('od 10" do 21.5"', 'from 10" to 21.5"')],
  [
    "hw3",
    loc("Kolory urządzeń", "Device colors"),
    loc("dowolne z palety RAL", "any from the RAL palette"),
  ],
  ["hw6", loc("Rozwiązania", "Solutions"), loc("indoor i outdoor", "indoor and outdoor")],
].map(([key, label, value]) => ({ _key: key, _type: "hwRow", label, value }));

for (const id of ["homePage", "drafts.homePage"]) {
  const exists = await client.fetch(`*[_id==$id][0]._id`, { id });
  if (!exists) {
    console.log(`— ${id}: brak dokumentu, pomijam`);
    continue;
  }
  await client
    .patch(id)
    .set({ productHardwareRows: ROWS })
    .unset(["productHardwareMinLabel", "productHardwareMaxLabel"])
    .commit();
  console.log(`✓ ${id}: productHardwareRows (4 wiersze), usunięto Min/Max label`);
}

console.log("\nDone.");
