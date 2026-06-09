import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

// Dokładne frazy ASCII -> poprawny polski. Tylko widoczne teksty; krótkie
// tokeny tras/kotwic (np. "rozwiazanie", "/polityka-prywatnosci") NIE są tu
// ujęte, więc routing/anchory zostają nietknięte.
const MAP = {
  "Automatyczne, modulowe systemy odbioru przesylek typu pick-up in store dla sieci retailu. Projektujemy, produkujemy i wdrazamy rozwiazania dopasowane do specyfiki marki - od jednostki glownej z dotykowym ekranem po skalowalna konfiguracje skrytek i bezdotykowy odbior ponizej 10 sekund.":
    "Automatyczne, modułowe systemy odbioru przesyłek typu pick-up in store dla sieci retailu. Projektujemy, produkujemy i wdrażamy rozwiązania dopasowane do specyfiki marki - od jednostki głównej z dotykowym ekranem po skalowalną konfigurację skrytek i bezdotykowy odbiór poniżej 10 sekund.",
  "Bezdotykowa, bezkontaktowa obsluga zwieksza bezpieczenstwo klientow i sluzb sprzedazy.":
    "Bezdotykowa, bezkontaktowa obsługa zwiększa bezpieczeństwo klientów i służb sprzedaży.",
  "Dedykowane pakiety serwisowe i rozwoj systemu zapewniajace trwalosc i stabilnosc rozwiazania.":
    "Dedykowane pakiety serwisowe i rozwój systemu zapewniające trwałość i stabilność rozwiązania.",
  "Gwarantujemy elastycznosc w integracji - w sposobie komunikacji, jak i zakresie przesylanych danych.":
    "Gwarantujemy elastyczność w integracji - w sposobie komunikacji, jak i zakresie przesyłanych danych.",
  "Zagwarantujemy zgodnosc z zasadami przetwarzania danych osobowych.":
    "Zagwarantujemy zgodność z zasadami przetwarzania danych osobowych.",
  "Instalacja i konfiguracja systemu z klientem, upewnienie sie czy zakres jest adekwatny do oczekiwan.":
    "Instalacja i konfiguracja systemu z klientem, upewnienie się czy zakres jest adekwatny do oczekiwań.",
  "Odbior ponizej 10 sekund, krotsze kolejki i zwolnienie przestrzeni magazynowej zaplecza.":
    "Odbiór poniżej 10 sekund, krótsze kolejki i zwolnienie przestrzeni magazynowej zaplecza.",
  "Standardowa konfiguracja PickUpWall dla sklepow o duzym ruchu, zoptymalizowana pod paczki o roznych wymiarach.":
    "Standardowa konfiguracja PickUpWall dla sklepów o dużym ruchu, zoptymalizowana pod paczki o różnych wymiarach.",
  "Rozszerzona konfiguracja PickUpWall dla sklepow o duzym ruchu, zoptymalizowana pod paczki o roznych wymiarach.":
    "Rozszerzona konfiguracja PickUpWall dla sklepów o dużym ruchu, zoptymalizowana pod paczki o różnych wymiarach.",
  "Kompaktowa konfiguracja PickUpWall dla sklepow o duzym ruchu, zoptymalizowana pod paczki o roznych wymiarach.":
    "Kompaktowa konfiguracja PickUpWall dla sklepów o dużym ruchu, zoptymalizowana pod paczki o różnych wymiarach.",
  "Dziekujemy! Wiadomosc zostala wyslana.": "Dziękujemy! Wiadomość została wysłana.",
  "Cos poszlo nie tak. Sprobuj ponownie lub napisz na kontakt@retailo.pl.":
    "Coś poszło nie tak. Spróbuj ponownie lub napisz na kontakt@retailo.pl.",
  "Cos poszlo nie tak. Sprobuj ponownie.": "Coś poszło nie tak. Spróbuj ponownie.",
  "Automatyczne systemy odbioru przesylek": "Automatyczne systemy odbioru przesyłek",
  "Wszelkie prawa zastrzezone": "Wszelkie prawa zastrzeżone",
  "Polityka prywatnosci": "Polityka prywatności",
  "Wlasny projekt": "Własny projekt",
  "Planujesz wdrozenie PickUpWall?": "Planujesz wdrożenie PickUpWall?",
  "Porozmawiajmy o podobnym wdrozeniu": "Porozmawiajmy o podobnym wdrożeniu",
  "Zobacz nasze wdrozenia": "Zobacz nasze wdrożenia",
  "Zdjecia z wdrozenia.": "Zdjęcia z wdrożenia.",
  "Dane wdrozenia": "Dane wdrożenia",
  "Konfiguracja wdrozenia": "Konfiguracja wdrożenia",
  "Rok wdrozenia": "Rok wdrożenia",
  "Wdrozenie krok po kroku": "Wdrożenie krok po kroku",
  "Wdrozenia w calej Europie": "Wdrożenia w całej Europie",
  "Nasze rozwiazanie": "Nasze rozwiązanie",
  "Kolory urzadzen": "Kolory urządzeń",
  "Imie i nazwisko": "Imię i nazwisko",
  "Opisz krotko temat rozmowy...": "Opisz krótko temat rozmowy...",
  "Otworz menu": "Otwórz menu",
  "Wysylanie...": "Wysyłanie...",
  "Nastepna": "Następna",
  "Nastepne zdjecie": "Następne zdjęcie",
  "Powieksz zdjecie": "Powiększ zdjęcie",
  "Wiadomosc...": "Wiadomość...",
  "Wyslij": "Wyślij",
  "Odezwiemy sie w ciagu 24h": "Odezwiemy się w ciągu 24h",
  // nav fallback label (wielka litera; nie rusza kotwicy "rozwiazanie")
  '"Rozwiazanie"': '"Rozwiązanie"',
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
