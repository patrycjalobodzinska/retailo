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

// Zdania do podmiany: marker (stary tekst) -> nowy tekst (Consent Mode v2).
const REPLACEMENTS = [
  {
    lang: "pl",
    match: "w ogóle się nie ładują",
    text:
      "Analityczne - Google Analytics 4 (m.in. „_ga”, „_ga_*”; przechowywane do 24 miesięcy), służące do tworzenia anonimowych statystyk odwiedzin. Działają w trybie Google Consent Mode v2: skrypt Google Analytics ładuje się, ale do czasu wyrażenia przez Ciebie zgody nie zapisuje plików cookies ani nie zbiera danych umożliwiających identyfikację (tryb „denied”). Pełne zbieranie danych i zapis cookies następują dopiero po wyrażeniu zgody w banerze, a jej cofnięcie je zatrzymuje.",
  },
  {
    lang: "en",
    match: "do not load at all",
    text:
      "Analytics - Google Analytics 4 cookies (e.g. „_ga”, „_ga_*”; stored for up to 24 months) used to produce anonymous visit statistics. They run in Google Consent Mode v2: the Google Analytics script loads, but until you give consent it does not store cookies or collect identifying data (denied mode). Full data collection and cookie storage start only after you consent in the banner, and withdrawing consent stops them.",
  },
];

const langCode = (t, codeById) =>
  codeById[t?.language?._ref] ?? t?.language?._ref;

const langs = await client.fetch(`*[_type=="language"]{_id, code}`);
const codeById = Object.fromEntries(langs.map((l) => [l._id, l.code]));

for (const id of [
  "legalPage-polityka-prywatnosci",
  "drafts.legalPage-polityka-prywatnosci",
]) {
  const doc = await client.fetch(`*[_id==$id][0]{ _id, body }`, { id });
  if (!doc?._id) {
    console.log(`- ${id}: brak, pomijam`);
    continue;
  }
  let changed = false;
  for (const t of doc.body?.translations ?? []) {
    const code = langCode(t, codeById);
    const rep = REPLACEMENTS.find((r) => r.lang === code);
    if (!rep || !Array.isArray(t.value)) continue;
    for (const block of t.value) {
      for (const child of block.children ?? []) {
        if (typeof child.text === "string" && child.text.includes(rep.match)) {
          child.text = rep.text;
          changed = true;
          console.log(`  ${id} [${code}]: zaktualizowano blok`);
        }
      }
    }
  }
  if (changed) {
    await client.patch(id).set({ body: doc.body }).commit();
    console.log(`✓ ${id}`);
  } else {
    console.log(`- ${id}: nie znaleziono frazy (pomijam)`);
  }
}

console.log("\nDone.");
