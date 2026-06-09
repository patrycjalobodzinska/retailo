import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createClient } from "@sanity/client";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]])
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

// ASCII (bez ogonków) -> poprawny polski. Klucze MAŁĄ literą; zamiana zachowuje
// wielką pierwszą literę. Słowa-identyfikatory/trasy ("rozwiazanie" jako
// kotwica, "prywatnosci" w /polityka-prywatnosci) celowo POMINIĘTE w kodzie.
const WORD_MAP = {
  wdrazamy: "wdrażamy", wdrazany: "wdrażany", wdrazane: "wdrażane",
  wdrazana: "wdrażana", wdrazanie: "wdrażanie", wdrazajac: "wdrażając",
  wdrozenie: "wdrożenie", wdrozenia: "wdrożenia", wdrozen: "wdrożeń",
  wdrozeniu: "wdrożeniu", wdrozeniach: "wdrożeniach",
  urzadzenie: "urządzenie", urzadzenia: "urządzenia", urzadzen: "urządzeń",
  urzadzeniu: "urządzeniu", urzadzeniem: "urządzeniem",
  ktore: "które", ktorej: "której", ktory: "który", ktora: "która",
  ktorych: "których", ktorym: "którym", ktorzy: "którzy", ktos: "ktoś",
  mozliwosc: "możliwość", mozliwosci: "możliwości", mozliwe: "możliwe",
  moze: "może", mozna: "można",
  wielkosc: "wielkość", wielkosci: "wielkości",
  bezpieczenstwo: "bezpieczeństwo", bezpieczenstwa: "bezpieczeństwa",
  obsluga: "obsługa", obslugi: "obsługi", obsluge: "obsługę",
  obslugujemy: "obsługujemy",
  przesylek: "przesyłek", przesylki: "przesyłki", przesylka: "przesyłka",
  przesylanych: "przesyłanych", przesylane: "przesyłane",
  sluzb: "służb", sluzby: "służby",
  sprzedazy: "sprzedaży", sprzedaz: "sprzedaż",
  zamowien: "zamówień", zamowienia: "zamówienia", zamowieniami: "zamówieniami",
  zamowieniach: "zamówieniach", zamowienie: "zamówienie",
  branzy: "branży", branza: "branża", branze: "branże",
  modulow: "modułów", modulu: "modułu", moduly: "moduły", modul: "moduł",
  modulami: "modułami", modulem: "modułem", modularny: "modularny",
  zabudow: "zabudów", zabudowy: "zabudowy", zabudowa: "zabudowa",
  glownej: "głównej", glowna: "główna", glowny: "główny", glownie: "głównie",
  glowne: "główne", glownego: "głównego",
  najwiekszych: "największych", najwiekszymi: "największymi",
  najwiekszy: "największy", najwieksze: "największe", najwieksza: "największa",
  wiekszy: "większy", wieksza: "większa", wieksze: "większe",
  zwieksza: "zwiększa", zwiekszenie: "zwiększenie", zwiekszajac: "zwiększając",
  zwiekszyc: "zwiększyć",
  skrocenie: "skrócenie", skroceniu: "skróceniu", skrocenia: "skrócenia",
  krotsze: "krótsze", krotszy: "krótszy", krotka: "krótka", krotko: "krótko",
  elastycznosc: "elastyczność", elastyczna: "elastyczna",
  zgodnosc: "zgodność", trwalosc: "trwałość", stabilnosc: "stabilność",
  latwosc: "łatwość", latwy: "łatwy", latwe: "łatwe", latwo: "łatwo",
  latwa: "łatwa", latwiejszy: "łatwiejszy",
  modularnosc: "modularność", skalowalnosc: "skalowalność",
  uniwersalnosc: "uniwersalność", wydajnosc: "wydajność",
  skalowalna: "skalowalną", skalowalne: "skalowalne",
  odbior: "odbiór", odbioru: "odbioru",
  ponizej: "poniżej", powyzej: "powyżej",
  calej: "całej", calym: "całym", cala: "cała", caly: "cały", cale: "całe",
  oczekiwan: "oczekiwań", oczekiwania: "oczekiwania",
  usunieta: "usunięta", usuniety: "usunięty", usuniete: "usunięte",
  niewlasciwy: "niewłaściwy", niewlasciwa: "niewłaściwa",
  sprawdz: "sprawdź", wroc: "wróć", wrocic: "wrócić",
  rozwoj: "rozwój", rozwoju: "rozwoju",
  zapewniajace: "zapewniające", zapewniajacy: "zapewniający",
  zapewniajaca: "zapewniająca", zapewniajacych: "zapewniających",
  umozliwiajace: "umożliwiające", umozliwia: "umożliwia",
  umozliwiajacy: "umożliwiający",
  wlasny: "własny", wlasna: "własna", wlasne: "własne", wlasnie: "właśnie",
  modulowy: "modułowy", modulowa: "modułowa", modulowe: "modułowe",
  otworz: "otwórz", wyslij: "wyślij",
  wiadomosc: "wiadomość", wiadomosci: "wiadomości",
  imie: "imię", powieksz: "powiększ",
  nastepne: "następne", nastepna: "następna", nastepny: "następny",
  nastepnie: "następnie",
  dziekujemy: "dziękujemy", wysylanie: "wysyłanie",
  wyslana: "wysłana", wyslane: "wysłane", wyslano: "wysłano",
  zostala: "została", zostal: "został", zostalo: "zostało", zostaly: "zostały",
  poszlo: "poszło", sprobuj: "spróbuj",
  posrednictwa: "pośrednictwa", posrednictwo: "pośrednictwo",
  wylaczenie: "wyłączenie", wlaczenie: "włączenie", wlaczajac: "włączając",
  zagrozenia: "zagrożenia", zagrozenie: "zagrożenie",
  miedzy: "między", pelnym: "pełnym", pelny: "pełny", pelna: "pełna",
  pelne: "pełne", pelnym: "pełnym",
  szczegolow: "szczegółów", szczegoly: "szczegóły",
  paczke: "paczkę", paczki: "paczki",
  przestrzen: "przestrzeń", marke: "markę", obudowe: "obudowę",
  grafike: "grafikę", liczbe: "liczbę",
  dazymy: "dążymy", dazy: "dąży",
  sie: "się", tez: "też", juz: "już", wiec: "więc",
  rowniez: "również", roznych: "różnych", roznymi: "różnymi",
  rozne: "różne", rozny: "różny", rozna: "różna", roznica: "różnica",
  duzym: "dużym", duza: "duża", duze: "duże", duzo: "dużo",
  wlasciwy: "właściwy", wlasciwie: "właściwie",
  najblizsze: "najbliższe", najblizszy: "najbliższy", blisko: "blisko",
  upewnienie: "upewnienie", upewnic: "upewnić",
  rozwiazania: "rozwiązania", rozwiazaniem: "rozwiązaniem",
  rozwiazan: "rozwiązań",
  wspolpracujemy: "współpracujemy", wspolpraca: "współpraca",
  wspolpracy: "współpracy",
  bezpieczna: "bezpieczna", bezpieczny: "bezpieczny",
  efektowna: "efektowna",
};

// Słowa, których NIE ruszamy w KODZIE (identyfikatory/trasy/kotwice).
const CODE_SKIP = new Set(["rozwiazanie", "prywatnosci"]);

function makeReplacer(skip) {
  const entries = Object.entries(WORD_MAP).filter(([a]) => !skip.has(a));
  // sort dłuższe najpierw (np. "wdrozenia" przed "wdrozen")
  entries.sort((a, b) => b[0].length - a[0].length);
  const res = entries.map(([a, p]) => [new RegExp("\\b" + a + "\\b", "gi"), p]);
  return (text) => {
    let out = text;
    for (const [re, p] of res) {
      out = out.replace(re, (m) => {
        const cap = m[0] !== m[0].toLowerCase();
        return cap ? p[0].toUpperCase() + p.slice(1) : p;
      });
    }
    return out;
  };
}

// ---------- KOD ----------
const codeReplace = makeReplacer(CODE_SKIP);
const files = execSync(
  `find src sanity -type f \\( -name '*.ts' -o -name '*.tsx' \\)`,
  { encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean);
let codeChanged = 0;
for (const f of files) {
  const s = readFileSync(f, "utf8");
  const out = codeReplace(s);
  if (out !== s) {
    writeFileSync(f, out);
    codeChanged++;
  }
}
console.log(`KOD: zmieniono ${codeChanged} plików.`);

// ---------- SANITY (tylko wartości PL w tłumaczeniach) ----------
const sanityReplace = makeReplacer(new Set()); // w danych nic nie pomijamy
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

const docs = await client.fetch(
  `*[!(_type match "system.*") && _type!="language"]`,
);
const walk = (node) => {
  let changed = false;
  if (node == null) return false;
  if (Array.isArray(node)) {
    for (const v of node) if (walk(v)) changed = true;
    return changed;
  }
  if (typeof node !== "object") return false;
  if (Array.isArray(node.translations)) {
    for (const t of node.translations) {
      if (langOf(t) === "pl" && typeof t.value === "string") {
        const next = sanityReplace(t.value);
        if (next !== t.value) {
          t.value = next;
          changed = true;
        }
      } else if (langOf(t) === "pl" && t.value && typeof t.value === "object") {
        if (walk(t.value)) changed = true;
      }
    }
    return changed;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k[0] === "_") continue;
    if (typeof v === "object" && walk(v)) changed = true;
  }
  return changed;
};
let sanityChanged = 0;
for (const d of docs) {
  if (walk(d)) {
    await client.createOrReplace(d);
    sanityChanged++;
    console.log("  ✓ " + d._id);
  }
}
console.log(`SANITY: zmieniono ${sanityChanged} dokumentów.`);
console.log("\nDone.");
