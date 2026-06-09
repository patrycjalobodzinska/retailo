import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

// Druga tura. Prefiksy `title:` / `label:` chronią wewnętrzne klucze
// (kind/case) przed zmianą.
const MAP = {
  'title: "Modularnosc"': 'title: "Modularność"',
  'title: "Skalowalnosc"': 'title: "Skalowalność"',
  'title: "Bezpieczenstwo"': 'title: "Bezpieczeństwo"',
  'title: "Uniwersalnosc"': 'title: "Uniwersalność"',
  'desc: "Wielkosc i liczba skrytek dostosowana do potrzeb i specyfiki branzy klienta."':
    'desc: "Wielkość i liczba skrytek dostosowana do potrzeb i specyfiki branży klienta."',
  'desc: "Mozliwosc instalowania dodatkowych modulow."':
    'desc: "Możliwość instalowania dodatkowych modułów."',
  'desc: "Wymiary modulow w zgodzie ze standardami zabudow meblowych w retailu."':
    'desc: "Wymiary modułów w zgodzie ze standardami zabudów meblowych w retailu."',
  'label: "Czern"': 'label: "Czerń"',
  'PickUpWall to rozwiazanie do zamowien typu "pick up in store".':
    'PickUpWall to rozwiązanie do zamówień typu "pick up in store".',
  "Wspolpracujemy z najwiekszymi markami.":
    "Współpracujemy z największymi markami.",
  "PickUpWall wdrazany w salonach kosmetycznych, fashion i elektroniki.":
    "PickUpWall wdrażany w salonach kosmetycznych, fashion i elektroniki.",
  "Wdrazamy dla najwiekszych marek.": "Wdrażamy dla największych marek.",
  "Strona glowna": "Strona główna",
  "Zobacz wdrozenia": "Zobacz wdrożenia",
  "retailo. - strona glowna": "retailo. - strona główna",
};

const files = execSync(`find src -type f \\( -name '*.ts' -o -name '*.tsx' \\)`, {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);

let total = 0;
for (const f of files) {
  let s = readFileSync(f, "utf8");
  let changed = false;
  for (const [from, to] of Object.entries(MAP)) {
    if (s.includes(from)) {
      s = s.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(f, s);
    total++;
    console.log("✓ " + f);
  }
}
console.log(`\nZmieniono ${total} plików.`);
