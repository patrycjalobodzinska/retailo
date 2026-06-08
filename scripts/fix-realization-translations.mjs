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

const EN_REF = "language-en";
const PL_REF = "language-pl";

// Słownik PL → EN. Stosowany do title / summary / specs label/value.
// Tłumaczenia NOWYCH treści (polski = źródło). Klucz dopasowywany po .trim().
const DICT = {
  // titles
  "PickupWall Madryt": "PickUpWall Madrid",
  // summaries
  "Wdrożenie PickUpWall w salonie Sephora. Konfiguracja składająca się z 4 modułów podzielonych na dwie sekcje ustawione naprzeciwko siebie.":
    "PickUpWall deployment in a Sephora store. A configuration of 4 modules split into two sections facing each other.",
  "Wdrożenie Click & Collect w Westfield Mall of Scandinavia\nSolna w Sztockholmie. Standardowy układ Master + Slave. Dedykowana nadstawka z neonowym napisem, zrównująca wysokość urządzenia z istniejącą zabudową meblową":
    "Click & Collect deployment at Westfield Mall of Scandinavia\nSolna in Stockholm. Standard Master + Slave layout. A dedicated top extension with a neon sign, matching the unit's height to the existing furniture.",
  "Wdrożenie Click & Collect przy Pułaskiego we Włocławku. Standardowy układ Master + Slave, dedykowana grafika obudowy.":
    "Click & Collect deployment on Pułaskiego in Włocławek. Standard Master + Slave layout, with a custom enclosure graphic.",
  "Wdrożenie PickUpWall w salonie Empik we Włocławku dla zamówień internetowych, integracja z platformą sprzedażową, dedykowana grafika obudowy w identyfikacji marki.":
    "PickUpWall deployment in the Empik store in Włocławek for online orders, integration with the sales platform and a custom enclosure graphic in the brand's identity.",
  "Instalacja w lokalizacji premium przy Vittorio Emanuele w Mediolanie. Master + Slave, integracja z systemem zamówień klienta.":
    "Installation in a premium location on Vittorio Emanuele in Milan. Master + Slave, integration with the client's order system.",
  "Urządzenie zamontowane w dedykowanej zabudowie ściennej.":
    "The unit installed in a dedicated wall enclosure.",
  "Urządzenie zamontowane w dedykowanej zabudowie ściennej, idealnie komponujące się z aranżacją salonu.":
    "The unit installed in a dedicated wall enclosure, blending in perfectly with the store's interior.",
  // specs
  Personalziacja: "Personalisation",
  "Oklejenie grafiką klienta": "Custom client graphic wrap",
  "Odbiór zamówień": "Order pick-up",
  "24/7": "24/7",
};

// Lokalizacje, którym brakuje EN (klucz = pl PO zamianie separatora na " · ").
const LOCATION_EN = {
  "Calle de Goya 85 · Madryt": "Calle de Goya 85 · Madrid",
};

const valByRef = (obj, ref) =>
  (obj?.translations ?? []).find((t) => t?.language?._ref === ref)?.value;

const setLangValue = (obj, ref, value) => {
  if (!obj) return obj;
  const trans = obj.translations ?? [];
  const existing = trans.find((t) => t?.language?._ref === ref);
  if (existing) {
    existing.value = value;
  } else {
    const tmpl = trans[0];
    trans.push({
      _key: ref === EN_REF ? "en" : "pl",
      _type: tmpl?._type ?? "translation",
      language: { _type: "reference", _ref: ref },
      value,
    });
  }
  obj.translations = trans;
  return obj;
};

// Zamiana separatorów lokalizacji ( , i . ) na " · "; zwija wielokrotne.
const dotify = (s) =>
  s.replace(/\s*[,.]\s+/g, " · ").replace(/\s*,\s*$/g, "").trim();

// Ustaw EN ze słownika, gdy brakuje lub jest po polsku (==PL). Zwraca true gdy zmieniono.
const fixEnFromDict = (obj) => {
  if (!obj) return false;
  const pl = valByRef(obj, PL_REF);
  if (pl == null) return false;
  const target = DICT[pl] ?? DICT[pl.trim()];
  if (!target) return false;
  const en = valByRef(obj, EN_REF);
  if (en === target) return false;
  setLangValue(obj, EN_REF, target);
  return true;
};

const docs = await client.fetch(
  `*[_type=="realization"]{ _id, "slug": slug.current, title, location, summary, specs }`,
);

const missing = [];

for (const doc of docs) {
  const patch = {};
  const changed = [];

  // title
  if (fixEnFromDict(doc.title)) {
    patch.title = doc.title;
    changed.push("title.en");
  }

  // summary
  if (fixEnFromDict(doc.summary)) {
    patch.summary = doc.summary;
    changed.push("summary.en");
  } else if (doc.summary) {
    const pl = valByRef(doc.summary, PL_REF);
    const en = valByRef(doc.summary, EN_REF);
    if (pl && (!en || en === pl) && !(DICT[pl] ?? DICT[pl.trim()])) {
      missing.push(`${doc.slug} → summary: "${pl.slice(0, 60)}…"`);
    }
  }

  // location: separatory + ewentualny brakujący EN
  if (doc.location) {
    let touched = false;
    for (const t of doc.location.translations ?? []) {
      if (typeof t.value === "string") {
        const next = dotify(t.value);
        if (next !== t.value) {
          t.value = next;
          touched = true;
        }
      }
    }
    const pl = valByRef(doc.location, PL_REF);
    const en = valByRef(doc.location, EN_REF);
    if (pl && (!en || en === pl)) {
      const enLoc = LOCATION_EN[pl];
      if (enLoc && en !== enLoc) {
        setLangValue(doc.location, EN_REF, enLoc);
        touched = true;
      } else if (!enLoc && !en) {
        missing.push(`${doc.slug} → location.en: "${pl}"`);
      }
    }
    if (touched) {
      patch.location = doc.location;
      changed.push("location");
    }
  }

  // specs
  if (Array.isArray(doc.specs) && doc.specs.length) {
    let touched = false;
    for (const spec of doc.specs) {
      if (fixEnFromDict(spec.label)) touched = true;
      if (fixEnFromDict(spec.value)) touched = true;
      for (const part of ["label", "value"]) {
        const pl = valByRef(spec[part], PL_REF);
        const en = valByRef(spec[part], EN_REF);
        if (pl && (!en || en === pl) && !(DICT[pl] ?? DICT[pl.trim()]))
          missing.push(`${doc.slug} → spec.${part}: "${pl}"`);
      }
    }
    if (touched) {
      patch.specs = doc.specs;
      changed.push("specs.en");
    }
  }

  if (Object.keys(patch).length) {
    await client.patch(doc._id).set(patch).commit();
    console.log(`✓ ${doc._id}: ${changed.join(", ")}`);
  }
}

if (missing.length) {
  console.log("\n⚠ Brak tłumaczenia w słowniku (wpisz EN ręcznie lub dopisz do skryptu):");
  for (const m of [...new Set(missing)]) console.log("   - " + m);
} else {
  console.log("\nWszystko pokryte ✔");
}
