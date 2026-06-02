// Jednorazowy seed: wstawia przykładowy opis (rich text / Portable Text) do
// realizacji, które nie mają jeszcze pola `body`. Uruchom: node scripts/seed-realization-body.mjs
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

// Wczytanie .env.local bez dodatkowej zależności.
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

const block = (key, text, style = "normal") => ({
  _type: "block",
  _key: key,
  style,
  markDefs: [],
  children: [{ _type: "span", _key: key + "s", text, marks: [] }],
});

const exampleBody = [
  block(
    "b1",
    "Wdrożenie PickUpWall objęło projekt, produkcję i montaż ściany skrytek w pełni zintegrowanej z systemem zamówień klienta. Całość uruchomiliśmy bez zakłócania bieżącej pracy punktu.",
  ),
  block("b2", "Zakres prac", "h3"),
  block(
    "b3",
    "Konfigurację modułów (jednostka główna z ekranem dotykowym oraz jednostki rozszerzające) dobraliśmy do spodziewanego wolumenu odbiorów i dostępnej przestrzeni. Obudowę wykonano w identyfikacji wizualnej marki.",
  ),
  block(
    "b4",
    "Integracja z platformą sprzedażową zapewnia automatyczną obsługę odbioru zamówień internetowych oraz rezerwacji w sklepie — klient odbiera paczkę w kilka sekund, podając kod ze skrzynki odbiorczej.",
  ),
];

const docs = await client.fetch(
  `*[_type == "realization" && !defined(body)]{ _id, "slug": slug.current }`,
);

if (!docs.length) {
  console.log("Wszystkie realizacje mają już opis — nic do zrobienia.");
  process.exit(0);
}

for (const d of docs) {
  await client.patch(d._id).set({ body: exampleBody }).commit();
  console.log("Zaseedowano opis:", d.slug || d._id);
}
console.log(`Gotowe — ${docs.length} realizacji.`);
