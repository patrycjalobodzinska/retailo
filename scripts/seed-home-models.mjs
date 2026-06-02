// Jednorazowy seed sekcji „Modele PickUpWall" na stronie głównej:
// wgrywa zdjęcia modeli jako assety Sanity i ustawia homePage.models
// (nazwy + opisy PL/EN) oraz nagłówek sekcji. Idempotentny — jeśli modele
// już istnieją, nic nie robi.
//
// Uruchom: node scripts/seed-home-models.mjs

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01",
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const tr = (code, value) => ({
  _key: code,
  _type: "translation",
  language: { _type: "reference", _ref: `language-${code}` },
  value,
});
const locStr = (pl, en) => ({
  _type: "localizedString",
  translations: [tr("pl", pl), tr("en", en)],
});
const locText = (pl, en) => ({
  _type: "localizedText",
  translations: [tr("pl", pl), tr("en", en)],
});

const MODELS = [
  {
    file: "public/model2_retailo.png",
    featured: false,
    name: ["PickUpWall M", "PickUpWall M"],
    desc: [
      "Standardowa konfiguracja dwujednostkowa do sklepów retail.",
      "Standard two-unit configuration for retail stores.",
    ],
  },
  {
    file: "public/model3_retailo.png",
    featured: true,
    name: ["PickUpWall L", "PickUpWall L"],
    desc: [
      "Rozszerzona konfiguracja dla wysokich wolumenów zamówień.",
      "Extended configuration for high order volumes.",
    ],
  },
  {
    file: "public/model4_retailo.png",
    featured: false,
    name: ["PickUpWall XL", "PickUpWall XL"],
    desc: [
      "Pełnowymiarowa ściana odbioru w przestrzeniach o dużym ruchu.",
      "Full-size pick-up wall for high-traffic spaces.",
    ],
  },
];

// Bezpiecznik: nie nadpisuj, jeśli modele już są (uniknij duplikatów assetów).
const published = await client.getDocument("homePage");
if (published?.models?.length) {
  console.log("homePage.models już istnieje — pomijam seed.");
  process.exit(0);
}

const models = [];
for (let i = 0; i < MODELS.length; i++) {
  const m = MODELS[i];
  const buf = readFileSync(new URL(`../${m.file}`, import.meta.url));
  const asset = await client.assets.upload("image", buf, {
    filename: m.file.split("/").pop(),
  });
  console.log("wgrano", m.file, "→", asset._id);
  models.push({
    _key: `model-${i}`,
    _type: "model",
    name: locStr(m.name[0], m.name[1]),
    description: locText(m.desc[0], m.desc[1]),
    featured: m.featured,
    image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
  });
}

const modelsHeadline = locStr(
  "Poznaj modele PickUpWall",
  "Meet the PickUpWall models",
);

for (const id of ["homePage", "drafts.homePage"]) {
  const exists = await client.getDocument(id);
  if (!exists) continue;
  await client.patch(id).set({ modelsHeadline, models }).commit();
  console.log("zaktualizowano", id);
}

console.log(`Gotowe — ${models.length} modeli.`);
