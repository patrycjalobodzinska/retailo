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

// PL → EN. Stosowane TYLKO gdy wartość PL dokładnie pasuje (po .trim()).
// Marki/terminy techniczne (PickUpWall, API, GLOBAL, retailo., Hardware,
// 24/7, nazwy modeli, nazwy własne realizacji) celowo NIE są tu ujęte.
const DICT = {
  // sekcja Integracja / oferta
  "Nasza oferta": "Our offering",
  "Integracja, instalacja, wsparcie": "Integration, installation, support",
  "Retailo. w ramach obsługi rozwiązania oferuje szereg usług dodatkowych, niezbędnych dla współpracy.":
    "As part of supporting the solution, Retailo. provides a range of additional services essential to the partnership.",
  Integracja: "Integration",
  "Gwarantujemy elastyczność w integracji – w sposobie komunikacji, jak i zakresie przesyłanych danych.":
    "We guarantee flexibility in integration - both in the communication method and in the scope of data exchanged.",
  RODO: "GDPR",
  "Zagwarantujemy zgodność z zasadami przetwarzania danych osobowych.":
    "We ensure compliance with personal data processing rules.",
  // korzyści
  "Korzyści wdrożenia": "Deployment benefits",
  Eliminacja: "Elimination",
  "Wyeliminowanie nieproduktywnego wykorzystania służb sprzedaży klienta poprzez wyłączenie ich pośrednictwa w procesie odbioru paczki.":
    "Eliminating the unproductive use of the client's sales staff by removing them from the parcel pick-up process.",
  "Wydatne skrócenie": "Significant reduction",
  "Wydatne skrócenie kolejek dzięki maksymalnemu skróceniu czasu odbioru.":
    "A significant reduction in queues thanks to a minimal pick-up time.",
  "Zwiększenie bezpieczeństwa": "Increased safety",
  "Zwiększenie bezpieczeństwa klienta i służb sprzedaży, zwłaszcza w sytuacji zagrożenia epidemiologicznego, dzięki wyłączeniu kontaktu między służbami sprzedaży a klientem.":
    "Greater safety for both customers and sales staff, especially during an epidemic risk, by removing contact between sales staff and the customer.",
  "Zwolnienie przestrzeni": "Freed-up space",
  "Zwolnienie przestrzeni magazynowej na zapleczu punktu sprzedaży.":
    "Freeing up storage space in the back of the store.",
  // system (realizationsSystemItems)
  "Efektowna, modularna szafa ze skrytkami do automatycznego odbioru zamówień klientów ecommerce.":
    "A striking, modular locker cabinet for automated pick-up of e-commerce orders.",
  "Łatwość obsługi": "Ease of use",
  "Czytelny ekran LCD, czytnik kodów QR umożliwiające łatwy i bezdotykowy odbiór paczki.":
    "A clear LCD screen and a QR code reader enable easy, contactless parcel pick-up.",
  "Zamówienia 360°": "360° orders",
  "System z pełnym procesem obsługi zamówienia od otrzymania szczegółów, przez obsługę umieszczenia paczki, po komunikację do klienta.":
    "A system covering the full order process - from receiving the details, through placing the parcel, to customer communication.",
  // QA tile (czas odbioru — także 15→10)
  "Odbiór poniżej 15 sekund, krótsze kolejki i zwolnienie przestrzeni magazynowej zaplecza.":
    "Pick-up in under 10 seconds, shorter queues and freed-up back-office storage space.",
  // kraje (kolumny)
  Polska: "Poland",
  Niemcy: "Germany",
  Francja: "France",
  Hiszpania: "Spain",
  Włochy: "Italy",
  "Wielka Brytania": "United Kingdom",
  Czechy: "Czechia",
  Słowacja: "Slovakia",
  Austria: "Austria",
  Rumunia: "Romania",
  Szwecja: "Sweden",
  Holandia: "Netherlands",
  Dania: "Denmark",
  Turcja: "Turkey",
};

// Nazwa PL kraju → kod ISO_A2 (zgodnie z MapCountriesInput).
const ISO_BY_NAME = {
  Polska: "PL",
  Niemcy: "DE",
  Francja: "FR",
  Hiszpania: "ES",
  Włochy: "IT",
  "Wielka Brytania": "GB",
  Czechy: "CZ",
  Słowacja: "SK",
  Austria: "AT",
  Rumunia: "RO",
  Szwecja: "SE",
  Holandia: "NL",
  Dania: "DK",
  Turcja: "TR",
};

// Transformacje pojedynczego stringa: pauzy → "-", 15 s → 10 s.
const fixString = (s) =>
  s
    .replace(/[—–]/g, "-")
    .replace(/15 sekund/g, "10 sekund")
    .replace(/15 s\b/g, "10 s");

const setLangValue = (obj, ref, value) => {
  const trans = obj.translations ?? (obj.translations = []);
  const existing = trans.find((t) => t?.language?._ref === ref);
  if (existing) existing.value = value;
  else
    trans.push({
      _key: ref === "language-en" ? "en" : "pl",
      _type: trans[0]?._type ?? "translation",
      language: { _type: "reference", _ref: ref },
      value,
    });
};

const isLocalized = (v) =>
  v && typeof v === "object" && Array.isArray(v.translations);

// Walk + mutate; zwraca true gdy coś zmieniono.
function transform(node) {
  let changed = false;
  if (node == null) return false;
  if (Array.isArray(node)) {
    for (const v of node) if (transform(v)) changed = true;
    return changed;
  }
  if (typeof node !== "object") return false;

  if (isLocalized(node)) {
    const plT = node.translations.find((t) => langOf(t) === "pl");
    const pl = plT?.value;
    if (typeof pl === "string") {
      const target = DICT[pl] ?? DICT[pl.trim()];
      if (target) {
        const enT = node.translations.find((t) => langOf(t) === "en");
        if (!enT || enT.value !== target) {
          setLangValue(node, "language-en", target);
          changed = true;
        }
      }
    }
    // transform we wszystkich tłumaczeniach: stringi (pauzy / 15→10) oraz
    // rich text (value = tablica bloków Portable Text) — rekurencja.
    for (const t of node.translations) {
      if (typeof t.value === "string") {
        const next = fixString(t.value);
        if (next !== t.value) {
          t.value = next;
          changed = true;
        }
      } else if (t.value && typeof t.value === "object") {
        if (transform(t.value)) changed = true;
      }
    }
    return changed;
  }

  for (const [k, v] of Object.entries(node)) {
    if (k === "_type" || k === "_ref" || k === "_key") continue;
    if (typeof v === "string") {
      const next = fixString(v);
      if (next !== v) {
        node[k] = next;
        changed = true;
      }
    } else if (typeof v === "object") {
      if (transform(v)) changed = true;
    }
  }
  return changed;
}

const isoFromColumns = (doc) => {
  const names = [...(doc.globalCountriesLeft ?? []), ...(doc.globalCountriesRight ?? [])]
    .map((loc) => loc?.translations?.find((t) => langOf(t) === "pl")?.value)
    .filter(Boolean);
  const iso = [];
  for (const n of names) {
    const code = ISO_BY_NAME[n?.trim()];
    if (code && !iso.includes(code)) iso.push(code);
    else if (!code) console.log(`   ⚠ brak ISO dla kraju: "${n}"`);
  }
  return iso;
};

const docs = await client.fetch(`*[!(_type match "system.*") && _type != "language"]`);

for (const doc of docs) {
  let changed = transform(doc);

  // globe: ISO z kolumn (tylko homePage)
  if (doc._type === "homePage") {
    const iso = isoFromColumns(doc);
    const cur = JSON.stringify(doc.globalMapCountries ?? []);
    if (iso.length && JSON.stringify(iso) !== cur) {
      doc.globalMapCountries = iso;
      changed = true;
      console.log(`   globe ${doc._id}: ISO = ${JSON.stringify(iso)}`);
    }
  }

  if (changed) {
    await client.createOrReplace(doc);
    console.log(`✓ ${doc._type} ${doc._id}`);
  }
}

console.log("\nDone.");
