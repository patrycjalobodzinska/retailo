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

const docs = await client.fetch(`*[!(_type match "system.*") && _type != "language"]`);

const missingEn = [];
const polishInEn = [];
const emDash = [];
const fifteen = [];

const isLocalized = (v) =>
  v && typeof v === "object" && Array.isArray(v.translations);

const langOf = (t) => codeById[t?.language?._ref] ?? t?.language?._ref;

function walk(node, path, docId, docType) {
  if (node == null) return;
  if (typeof node === "string") {
    if (node.includes("—")) emDash.push(`${docType} ${docId} @ ${path}: ${JSON.stringify(node)}`);
    if (/15\s*s(ek|\b|$)|<\s*15/.test(node) || node.includes("15 sekund"))
      fifteen.push(`${docType} ${docId} @ ${path}: ${JSON.stringify(node)}`);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${path}[${i}]`, docId, docType));
    return;
  }
  if (typeof node === "object") {
    if (isLocalized(node)) {
      const byLang = {};
      for (const t of node.translations) byLang[langOf(t)] = t.value;
      const pl = byLang.pl;
      const en = byLang.en;
      if (pl != null && (en == null || en === "")) {
        missingEn.push(`${docType} ${docId} @ ${path}: pl=${JSON.stringify(pl).slice(0, 70)}`);
      } else if (pl != null && en === pl && pl.trim()) {
        polishInEn.push(`${docType} ${docId} @ ${path}: ${JSON.stringify(pl).slice(0, 70)}`);
      }
      // still walk values for — and 15
      for (const t of node.translations)
        walk(t.value, `${path}.${langOf(t)}`, docId, docType);
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("_")) continue;
      walk(v, path ? `${path}.${k}` : k, docId, docType);
    }
  }
}

for (const d of docs) walk(d, "", d._id, d._type);

const dump = (title, arr) => {
  console.log(`\n===== ${title} (${arr.length}) =====`);
  for (const x of arr) console.log("  " + x);
};

dump("BRAK EN", missingEn);
dump("EN == PL (po polsku w EN)", polishInEn);
dump("EM DASH (—)", emDash);
dump("15 s / 15 sekund", fifteen);

// Country columns + map
const hp = await client.fetch(
  `*[_id=="homePage"][0]{ globalCountriesLeft, globalCountriesRight, globalMapCountries }`,
);
const colNames = (arr) =>
  (arr ?? []).map((loc) => {
    const by = {};
    for (const t of loc?.translations ?? []) by[langOf(t)] = t.value;
    return by.pl ?? by.en ?? "?";
  });
console.log("\n===== KRAJE w kolumnach =====");
console.log("  LEFT: ", JSON.stringify(colNames(hp?.globalCountriesLeft)));
console.log("  RIGHT:", JSON.stringify(colNames(hp?.globalCountriesRight)));
console.log("  MAP (ISO):", JSON.stringify(hp?.globalMapCountries ?? []));
