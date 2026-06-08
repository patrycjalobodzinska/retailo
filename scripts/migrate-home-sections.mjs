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

// Pola każdej sekcji (nazwy identyczne jak w homePage).
const SECTIONS = {
  homeHero: [
    "heroSubtitle", "heroDescription", "heroScrollLabel", "heroBadges",
    "heroInstallEyebrow", "heroInstallTitle", "heroInstallSubtitle",
  ],
  homeQa: ["qaEyebrow", "qaHeadline", "qaSubtitle", "qaTiles"],
  homeProduct: [
    "productEyebrow", "productHeadline", "productFeatures", "productBrandLabel",
    "productBrandName", "productSpecs", "productBenefitsHeadline",
    "productBenefits", "productStepsLabel", "productSpecsHeadline",
    "productHardwareLabel", "productHardwareRows",
  ],
  homeRealizations: [
    "realizationsEyebrow", "realizationsHeadline", "realizationsIntro",
    "realizationsCtaLabel", "realizationsCtaHref", "realizationsSystemEyebrow",
    "realizationsSystemHeadline", "realizationsSystemItems",
  ],
  homeIntegration: [
    "integrationEyebrow", "integrationHeadline", "integrationIntro",
    "integrationItems",
  ],
  homeModels: ["modelsVisible", "modelsHeadline", "models"],
  homeGlobal: [
    "globalEyebrow", "globalHeadline", "globalIntro", "globalCountriesLeft",
    "globalCountriesRight", "globalMapCountries", "globalCtaToggleLabel",
    "globalCtaTitle", "globalCtaSubtitle", "globalCtaNamePlaceholder",
    "globalCtaEmailPlaceholder", "globalCtaMessagePlaceholder",
    "globalCtaSubmitLabel",
  ],
};

// Obrazy treści: plik → (sekcja, pole).
const IMAGES = [
  ["public/model3_retailo.png", "homeHero", "heroImage"],
  ["public/sephora-pickupwall.jpeg", "homeHero", "heroInstallImage"],
  ["public/pickupwall-photo.png", "homeProduct", "productPhoto"],
  ["public/pickupwall-sketch.png", "homeProduct", "productSketch"],
  ["public/empik.png", "homeQa", "qaClientLogo"],
];

// Opisy modeli (DISTINCT) PL+EN, dopasowane po nazwie.
const MODEL_DESC = {
  M: {
    pl: "Kompaktowa konfiguracja do punktów z ograniczoną przestrzenią - maksimum skrytek tam, gdzie liczy się każdy metr.",
    en: "Compact configuration for spots with limited space - maximum lockers where every square metre counts.",
  },
  L: {
    pl: "Standardowa konfiguracja PickUpWall - uniwersalna baza, która sprawdza się w większości sklepów.",
    en: "Standard PickUpWall configuration - a versatile base that fits most stores.",
  },
  XL: {
    pl: "Rozszerzona konfiguracja dla sklepów o dużym ruchu, zoptymalizowana pod paczki o różnych wymiarach.",
    en: "Extended configuration for high-traffic stores, optimised for parcels of various sizes.",
  },
};

// Kraje: PL → {en, iso}. Pełniejsza lista na wypadek przyszłych zmian.
const COUNTRY = {
  Polska: { en: "Poland", iso: "PL" },
  Niemcy: { en: "Germany", iso: "DE" },
  Francja: { en: "France", iso: "FR" },
  Hiszpania: { en: "Spain", iso: "ES" },
  Włochy: { en: "Italy", iso: "IT" },
  "Wielka Brytania": { en: "United Kingdom", iso: "GB" },
  Czechy: { en: "Czechia", iso: "CZ" },
  Słowacja: { en: "Slovakia", iso: "SK" },
  Austria: { en: "Austria", iso: "AT" },
  Rumunia: { en: "Romania", iso: "RO" },
  Szwecja: { en: "Sweden", iso: "SE" },
  Holandia: { en: "Netherlands", iso: "NL" },
  Dania: { en: "Denmark", iso: "DK" },
  Turcja: { en: "Turkey", iso: "TR" },
  Norwegia: { en: "Norway", iso: "NO" },
  Finlandia: { en: "Finland", iso: "FI" },
  Belgia: { en: "Belgium", iso: "BE" },
  Szwajcaria: { en: "Switzerland", iso: "CH" },
};

const plOf = (loc) =>
  (loc?.translations ?? []).find((t) => langOf(t) === "pl")?.value;
const setEn = (loc, en) => {
  const tr = loc.translations ?? (loc.translations = []);
  const e = tr.find((t) => langOf(t) === "en");
  if (e) e.value = en;
  else
    tr.push({
      _key: "en",
      _type: "translation",
      language: { _type: "reference", _ref: "language-en" },
      value: en,
    });
};

// Upload obrazów raz, zwróć mapę pole→assetRef.
const assetByField = {};
for (const [path, , field] of IMAGES) {
  const buf = readFileSync(path);
  const asset = await client.assets.upload("image", buf, {
    filename: path.split("/").pop(),
  });
  assetByField[field] = {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
  console.log(`↑ ${path} → ${asset._id}`);
}

for (const prefix of ["", "drafts."]) {
  const src = await client.fetch(`*[_id==$id][0]`, { id: `${prefix}homePage` });
  if (!src) {
    console.log(`— ${prefix}homePage: brak, pomijam`);
    continue;
  }
  for (const [sectionId, fields] of Object.entries(SECTIONS)) {
    const doc = { _id: `${prefix}${sectionId}`, _type: sectionId };
    for (const f of fields) if (src[f] !== undefined) doc[f] = src[f];

    // obrazy treści
    for (const [, sec, field] of IMAGES)
      if (sec === sectionId) doc[field] = assetByField[field];

    // modele: distinct opisy + EN
    if (sectionId === "homeModels" && Array.isArray(doc.models)) {
      for (const m of doc.models) {
        const name = plOf(m.name) ?? "";
        const key = /XL/.test(name) ? "XL" : /\bL\b|L$/.test(name) ? "L" : /\bM\b|M$/.test(name) ? "M" : null;
        if (key) {
          m.description = {
            _type: "localizedText",
            translations: [
              { _key: "pl", _type: "translation", language: { _type: "reference", _ref: "language-pl" }, value: MODEL_DESC[key].pl },
              { _key: "en", _type: "translation", language: { _type: "reference", _ref: "language-en" }, value: MODEL_DESC[key].en },
            ],
          };
        }
      }
    }

    // global: uzupełnij EN krajów + przelicz mapę ISO z kolumn (źródło = kolumny)
    if (sectionId === "homeGlobal") {
      const cols = [...(doc.globalCountriesLeft ?? []), ...(doc.globalCountriesRight ?? [])];
      for (const loc of cols) {
        const pl = plOf(loc);
        const info = pl && COUNTRY[pl.trim()];
        if (info) setEn(loc, info.en);
      }
      const iso = [];
      for (const loc of cols) {
        const pl = plOf(loc);
        const info = pl && COUNTRY[pl.trim()];
        if (info && !iso.includes(info.iso)) iso.push(info.iso);
        else if (pl && !info) console.log(`   ⚠ brak ISO dla "${pl}"`);
      }
      doc.globalMapCountries = iso;
      console.log(`   globe ${prefix || "pub"}: ${JSON.stringify(iso)}`);
    }

    await client.createOrReplace(doc);
    console.log(`✓ ${doc._id}`);
  }
}

console.log("\nDone.");
