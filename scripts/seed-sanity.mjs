/**
 * Seed Sanity with all currently hardcoded copy.
 *
 *   $ node --env-file=.env.local scripts/seed-sanity.mjs
 *
 * Idempotent — uses fixed _id's and createOrReplace, so running twice
 * doesn't create duplicates. Languages start with "pl" (default); add more
 * inside the Studio (`/studio` → Języki → Stwórz nowy).
 */

import { createClient } from "@sanity/client";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "hl9im7uq";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error(
    "✘ SANITY_API_WRITE_TOKEN is missing. Add it to .env.local and re-run.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

const PL_LANG_ID = "language-pl";
const langRef = { _type: "reference", _ref: PL_LANG_ID };

const t = (value) => ({
  _type: "localizedString",
  translations: [
    {
      _type: "translation",
      _key: "pl",
      language: langRef,
      value,
    },
  ],
});
const tt = (value) => ({
  _type: "localizedText",
  translations: [
    {
      _type: "translation",
      _key: "pl",
      language: langRef,
      value,
    },
  ],
});

async function run() {
  console.log("→ Seedowanie języka domyślnego (PL)…");
  await client.createOrReplace({
    _id: PL_LANG_ID,
    _type: "language",
    code: "pl",
    name: "Polski",
    isDefault: true,
    order: 0,
  });

  console.log("→ Seedowanie ustawień strony…");
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    logoText: "retailo.",
    metaTitle: "Retailo",
    navigation: [
      { _key: "n1", href: "#rozwiazanie", label: t("Rozwiązanie") },
      { _key: "n2", href: "#system", label: t("System") },
      { _key: "n3", href: "#wdrozenia", label: t("Wdrożenia") },
      { _key: "n4", href: "#kontakt", label: t("Kontakt") },
    ],
    ctaLabel: t("Zapytaj o ofertę"),
    ctaHref: "#kontakt",
  });

  console.log("→ Seedowanie strony głównej…");
  const k = (id) => ({ _key: id });
  await client.createOrReplace({
    _id: "homePage",
    _type: "homePage",
    heroSubtitle: t("PickUpWall"),
    heroDescription: tt(
      "Automatyczne systemy odbioru przesyłek.\nProjektujemy, produkujemy i wdrażamy.",
    ),
    heroScrollLabel: t("Scroll down"),

    qaEyebrow: t("Nasze rozwiązanie"),
    qaHeadline: t("PickUpWall."),
    qaSubtitle: tt(
      'PickUpWall to rozwiązanie do zamówień typu "pick up in store".',
    ),
    qaTiles: [
      {
        ...k("modular"),
        title: t("Modularność"),
        description: tt(
          "Wielkość i liczba skrytek dostosowana do potrzeb i specyfiki branży klienta.",
        ),
      },
      {
        ...k("scal"),
        title: t("Skalowalność"),
        description: tt("Możliwość instalowania dodatkowych modułów."),
      },
      {
        ...k("pers"),
        title: t("Personalizacja"),
        description: tt(
          "Dedykowane grafiki i kolor obudowy. Opcjonalny ekran Digital Signage.",
        ),
      },
      {
        ...k("uni"),
        title: t("Uniwersalność"),
        description: tt(
          "Wymiary modułów w zgodzie ze standardami zabudów meblowych w retailu.",
        ),
      },
      {
        ...k("safe"),
        title: t("Bezpieczeństwo"),
        description: tt(
          "Bezdotykowa, bezkontaktowa obsługa zwiększa bezpieczeństwo klientów i służb sprzedaży.",
        ),
      },
      {
        ...k("perf"),
        title: t("Wydajność"),
        description: tt(
          "Odbiór poniżej 15 sekund, krótsze kolejki i zwolnienie przestrzeni magazynowej zaplecza.",
        ),
      },
    ],

    productEyebrow: t("Nasze rozwiązanie"),
    productHeadline: t("PickUpWall"),
    productFeatures: [
      {
        ...k("f1"),
        title: t("Modularność"),
        description: tt(
          "Wielkość i liczba skrytek dostosowana do potrzeb i specyfiki branży klienta",
        ),
      },
      {
        ...k("f2"),
        title: t("Skalowalność"),
        description: tt("Możliwość instalowania dodatkowych modułów"),
      },
      {
        ...k("f3"),
        title: t("Personalizacja"),
        description: tt(
          "Dedykowane grafiki i kolor obudowy. Opcjonalny ekran Digital Signage",
        ),
      },
      {
        ...k("f4"),
        title: t("Uniwersalność"),
        description: tt(
          "Wymiary modułów w zgodzie ze standardami zabudów meblowych w retailu",
        ),
      },
    ],
    productBrandLabel: t("retailo."),
    productBrandName: t("PickUpWall"),
    productSpecs: [
      { ...k("s1"), label: t("Typ"), value: t("Automat paczkowy") },
      { ...k("s2"), label: t("Skrytki"), value: t("Modularna konfiguracja") },
      { ...k("s3"), label: t("Ekran"), value: t('21.5" dotykowy') },
      { ...k("s4"), label: t("Odbiór"), value: t("< 15 sekund") },
      { ...k("s5"), label: t("Integracja"), value: t("API / Middleware") },
      { ...k("s6"), label: t("Serwis"), value: t("24/7 monitoring") },
    ],
    productBenefitsHeadline: t("Korzyści wdrożenia"),
    productBenefits: [
      {
        ...k("b1"),
        title: t("Eliminacja"),
        description: tt(
          "Wyeliminowanie nieproduktywnego wykorzystania służb sprzedaży klienta poprzez wyłączenie ich pośrednictwa w procesie odbioru paczki.",
        ),
      },
      {
        ...k("b2"),
        title: t("Wydatne skrócenie"),
        description: tt(
          "Wydatne skrócenie kolejek dzięki maksymalnemu skróceniu czasu odbioru.",
        ),
      },
      {
        ...k("b3"),
        title: t("Zwiększenie bezpieczeństwa"),
        description: tt(
          "Zwiększenie bezpieczeństwa klienta i służb sprzedaży, zwłaszcza w sytuacji zagrożenia epidemiologicznego, dzięki wyłączeniu kontaktu między służbami sprzedaży a klientem.",
        ),
      },
      {
        ...k("b4"),
        title: t("Zwolnienie przestrzeni"),
        description: tt(
          "Zwolnienie przestrzeni magazynowej na zapleczu punktu sprzedaży.",
        ),
      },
    ],

    realizationsEyebrow: t("Realizacje"),
    realizationsHeadline: t("PickUpWall w akcji."),
    realizationsIntro: tt(
      "Wybrane wdrożenia PickUpWall w punktach sprzedaży, galeriach i biurowcach w Polsce i za granicą.",
    ),
    realizationsCtaLabel: t("Zobacz wszystkie realizacje"),
    realizationsCtaHref: "/realizacje",
    realizationsSystemEyebrow: t("System obsługi zamówień"),
    realizationsSystemHeadline: t("PickUpWall"),
    realizationsSystemItems: [
      {
        ...k("sys1"),
        title: t("PickUpWall"),
        description: tt(
          "Efektowna, modularna szafa ze skrytkami do automatycznego odbioru zamówień klientów ecommerce.",
        ),
      },
      {
        ...k("sys2"),
        title: t("Łatwość obsługi"),
        description: tt(
          "Czytelny ekran LCD, czytnik kodów QR umożliwiające łatwy i bezdotykowy odbiór paczki.",
        ),
      },
      {
        ...k("sys3"),
        title: t("Zamówienia 360°"),
        description: tt(
          "System z pełnym procesem obsługi zamówienia od otrzymania szczegółów, przez obsługę umieszczenia paczki, po komunikację do klienta.",
        ),
      },
    ],

    integrationEyebrow: t("Nasza oferta"),
    integrationHeadline: t("Integracja, instalacja, wsparcie"),
    integrationIntro: tt(
      "Retailo. w ramach obsługi rozwiązania oferuje szereg usług dodatkowych, niezbędnych dla współpracy.",
    ),
    integrationItems: [
      {
        ...k("i1"),
        title: t("Integracja"),
        description: tt(
          "Gwarantujemy elastyczność w integracji – w sposobie komunikacji, jak i zakresie przesyłanych danych.",
        ),
      },
      {
        ...k("i2"),
        title: t("RODO"),
        description: tt(
          "Zagwarantujemy zgodność z zasadami przetwarzania danych osobowych.",
        ),
      },
      {
        ...k("i3"),
        title: t("Instalacja"),
        description: tt(
          "Instalacja i konfiguracja systemu z klientem, upewnienie się czy zakres jest adekwatny do oczekiwań.",
        ),
      },
      {
        ...k("i4"),
        title: t("Wsparcie"),
        description: tt(
          "Budowa sprzętu i rozwój systemu ma zapewnić jego trwałość i stabilność. Wsparcie dopasowane do potrzeb klienta poprzez dedykowane pakiety serwisowe.",
        ),
      },
    ],

    globalEyebrow: t("Globalnie"),
    globalHeadline: t("GLOBAL"),
    globalIntro: tt(
      "Wdrożenia PickUpWall w wielu krajach. Skontaktuj się — pokażemy najbliższe.",
    ),
  });

  console.log("→ Seedowanie strony realizacji…");
  await client.createOrReplace({
    _id: "realizationsPage",
    _type: "realizationsPage",
    eyebrow: t("Realizacje"),
    headline: t("Realizacje."),
    intro: tt(
      "Wybrane wdrożenia PickUpWall w punktach sprzedaży, galeriach handlowych, biurowcach i osiedlach mieszkaniowych w Polsce i za granicą.",
    ),
    backToHomeLabel: t("Powrót na stronę główną"),
  });

  console.log("✓ Gotowe — sprawdź /studio.");
}

run().catch((err) => {
  console.error("✘ Seed failed:", err);
  process.exit(1);
});
