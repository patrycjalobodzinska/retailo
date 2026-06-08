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
import { readFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

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
const EN_LANG_ID = "language-en";
const plRef = { _type: "reference", _ref: PL_LANG_ID };
const enRef = { _type: "reference", _ref: EN_LANG_ID };

// Helpers: t/tt akceptują plain string (PL) lub obiekt {pl, en}.
// Jeśli podano string — używa go jako PL i mapuje na EN przez słownik
// `EN_MAP` poniżej. Jeśli słownik nie zawiera klucza, wpisuje PL jako EN
// (lepsze niż brak treści — łatwo potem zedytować w Studio).
const EN_MAP = {
  // siteSettings + nawigacja
  "Rozwiązanie": "Solution",
  System: "System",
  "Wdrożenia": "Realizations",
  Kontakt: "Contact",
  "Zapytaj o ofertę": "Get a quote",
  "retailo.": "retailo.",
  Retailo: "Retailo",

  // hero
  PickUpWall: "PickUpWall",
  "Automatyczne systemy odbioru przesyłek.\nProjektujemy, produkujemy i wdrażamy.":
    "Automated parcel pick-up systems.\nWe design, manufacture and deploy.",
  "Scroll down": "Scroll down",

  // QA
  "Nasze rozwiązanie": "Our solution",
  "PickUpWall.": "PickUpWall.",
  'PickUpWall to rozwiązanie do zamówień typu "pick up in store".':
    'PickUpWall is a "pick up in store" order fulfillment solution.',
  "Modularność": "Modularity",
  "Wielkość i liczba skrytek dostosowana do potrzeb i specyfiki branży klienta.":
    "Locker size and count adapted to the client's needs and industry specifics.",
  "Skalowalność": "Scalability",
  "Możliwość instalowania dodatkowych modułów.":
    "Ability to install additional modules.",
  Personalizacja: "Personalization",
  "Dedykowane grafiki i kolor obudowy. Opcjonalny ekran Digital Signage.":
    "Custom graphics and case color. Optional Digital Signage screen.",
  "Uniwersalność": "Universality",
  "Wymiary modułów w zgodzie ze standardami zabudów meblowych w retailu.":
    "Module dimensions compliant with retail furniture-fit standards.",
  "Bezpieczeństwo": "Safety",
  "Bezdotykowa, bezkontaktowa obsługa zwiększa bezpieczeństwo klientów i służb sprzedaży.":
    "Touch-free, contactless operation improves safety for customers and staff.",
  "Wydajność": "Performance",

  // realizacje
  Realizacje: "Realizations",
  "PickUpWall w akcji.": "PickUpWall in action.",
  "Zobacz wszystkie realizacje": "See all realizations",
  "System obsługi zamówień": "Order fulfillment system",
  "Realizacje.": "Realizations.",
  "Powrót na stronę główną": "Back to home",
  "Wybrane wdrożenia PickUpWall w punktach sprzedaży, galeriach handlowych, biurowcach i osiedlach mieszkaniowych w Polsce i za granicą.":
    "Selected PickUpWall deployments in retail stores, shopping malls, office buildings and residential areas in Poland and abroad.",

  // integracje / global
  "Instalacja": "Installation",
  "Instalacja i konfiguracja systemu z klientem, upewnienie się czy zakres jest adekwatny do oczekiwań.":
    "On-site installation and configuration with the client, validating that scope meets expectations.",
  Wsparcie: "Support",
  "Budowa sprzętu i rozwój systemu ma zapewnić jego trwałość i stabilność. Wsparcie dopasowane do potrzeb klienta poprzez dedykowane pakiety serwisowe.":
    "Hardware build and software evolution ensure long-term reliability. Tailored service packages match client needs.",
  Globalnie: "Globally",
  GLOBAL: "GLOBAL",
  "Wdrożenia PickUpWall w wielu krajach. Skontaktuj się — pokażemy najbliższe.":
    "PickUpWall deployments across many countries. Get in touch — we'll show the closest one.",

  // realizacje individual titles + locations (extend if more needed)
  "PickUpWall Sephora": "PickUpWall Sephora",
  "PickUpWall Empik": "PickUpWall Empik",
  "PickUpWall Milano": "PickUpWall Milano",
  "PickUpWall Włocławek": "PickUpWall Włocławek",
  "PickUpWall Retail 2023": "PickUpWall Retail 2023",
  "PickUpWall Click & Collect": "PickUpWall Click & Collect",
  "PickUpWall Warszawa": "PickUpWall Warsaw",
  "PickUpWall Galeria": "PickUpWall Gallery",
  "Salon Sephora": "Sephora store",
  "Salon Empik": "Empik store",
  "Vittorio Emanuele · Mediolan": "Vittorio Emanuele · Milan",
  "Pułaskiego · Włocławek": "Pułaskiego · Włocławek",
  "Sklep stacjonarny": "Brick-and-mortar store",
  "Salon flagowy · Warszawa": "Flagship store · Warsaw",
  "Punkt sprzedaży · Warszawa": "Retail point · Warsaw",
  "Galeria handlowa": "Shopping gallery",
  "4 tygodnie": "4 weeks",
  "5 tygodni": "5 weeks",
  "6 tygodni": "6 weeks",
};

const enFor = (pl) => EN_MAP[pl] ?? pl;

const localizedEntry = (typeName) => (value) => {
  const pl = typeof value === "object" ? value.pl : value;
  const en = typeof value === "object" ? value.en : enFor(pl);
  return {
    _type: typeName,
    translations: [
      { _type: "translation", _key: "pl", language: plRef, value: pl },
      { _type: "translation", _key: "en", language: enRef, value: en },
    ],
  };
};

const t = localizedEntry("localizedString");
const tt = localizedEntry("localizedText");

async function run() {
  console.log("→ Seedowanie języków (PL, EN)…");
  await client.createOrReplace({
    _id: PL_LANG_ID,
    _type: "language",
    code: "pl",
    name: "Polski",
    isDefault: true,
    order: 0,
  });
  await client.createOrReplace({
    _id: EN_LANG_ID,
    _type: "language",
    code: "en",
    name: "English",
    isDefault: false,
    order: 1,
  });

  console.log("→ Seedowanie ustawień strony…");
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    logoText: "retailo.",
    metaTitle: "Retailo — Automatyczne systemy odbioru przesyłek PickUpWall",
    metaDescription:
      "PickUpWall — automatyczne, modułowe systemy odbioru przesyłek pick-up in store dla sieci retailu. Projektujemy, produkujemy i wdrażamy w całej Europie.",
    siteUrl: "https://retailo.pl",
    navigation: [
      {
        _key: "n1",
        href: "#rozwiazanie",
        label: t({ pl: "Rozwiązanie", en: "Solution" }),
      },
      {
        _key: "n2",
        href: "#realizacje",
        label: t({ pl: "Realizacje", en: "Realizations" }),
      },
      {
        _key: "n3",
        href: "#kontakt",
        label: t({ pl: "Kontakt", en: "Contact" }),
      },
    ],
    ctaLabel: t("Zapytaj o ofertę"),
    ctaHref: "#kontakt",
    footerTagline: t({ pl: "Automaty paczkowe", en: "Parcel lockers" }),
    footerEmail: "info@retailo.pl",
    footerPhone: "+48 123 456 789",
    footerAddress: t({
      pl: "ul. Przykładowa 10, 00-001 Warszawa",
      en: "Przykladowa 10, 00-001 Warsaw, Poland",
    }),
    footerCopyright: t({ pl: "© 2026 retailo", en: "© 2026 retailo" }),
    footerPrivacyLabel: t({
      pl: "Polityka prywatności",
      en: "Privacy policy",
    }),
    footerTermsLabel: t({ pl: "Regulamin", en: "Terms of service" }),
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
    heroBadges: [
      {
        ...k("hb1"),
        value: t("<15 s"),
        label: t({ pl: "Czas odbioru", en: "Pickup time" }),
      },
      {
        ...k("hb2"),
        value: t({ pl: "Modulowy", en: "Modular" }),
        label: t({ pl: "System skrytek", en: "Locker system" }),
      },
      {
        ...k("hb3"),
        value: t("API"),
        label: t({ pl: "Integracja", en: "Integration" }),
      },
    ],
    heroInstallEyebrow: t({ pl: "Zaufali nam", en: "Trusted by" }),
    heroInstallTitle: t({
      pl: "Wdrażamy dla największych marek.",
      en: "We deploy for the biggest brands.",
    }),
    heroInstallSubtitle: t({
      pl: "Sieci kosmetyczne, fashion, elektronika.",
      en: "Beauty, fashion, and electronics chains.",
    }),

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

    productEyebrow: t({ pl: "Nasze rozwiązanie", en: "Our solution" }),
    productHeadline: t("PickUpWall"),
    productStepsLabel: t({
      pl: "Wdrozenie krok po kroku",
      en: "Step by step rollout",
    }),
    productFeatures: [
      {
        ...k("f1"),
        title: t({ pl: "Integracja", en: "Integration" }),
        description: tt({
          pl: "Gwarantujemy elastyczność w integracji — w sposobie komunikacji, jak i zakresie przesyłanych danych.",
          en: "We guarantee flexibility in integration — both in the communication method and in the scope of data exchanged.",
        }),
      },
      {
        ...k("f2"),
        title: t("RODO"),
        description: tt({
          pl: "Zagwarantujemy zgodność z zasadami przetwarzania danych osobowych.",
          en: "We ensure full compliance with personal data processing regulations (GDPR).",
        }),
      },
      {
        ...k("f3"),
        title: t({ pl: "Instalacja", en: "Installation" }),
        description: tt({
          pl: "Instalacja i konfiguracja systemu z klientem, upewnienie się czy zakres jest adekwatny do oczekiwań.",
          en: "On-site installation and configuration alongside the client, validating that scope meets expectations.",
        }),
      },
      {
        ...k("f4"),
        title: t({ pl: "Wsparcie", en: "Support" }),
        description: tt({
          pl: "Dedykowane pakiety serwisowe i rozwój systemu zapewniające trwałość i stabilność rozwiązania.",
          en: "Tailored service packages and ongoing system evolution to ensure long-term reliability and stability.",
        }),
      },
    ],
    productBrandLabel: t("retailo."),
    productBrandName: t("PickUpWall"),
    productSpecsHeadline: t({
      pl: "Specyfikacja techniczna",
      en: "Technical specification",
    }),
    productSpecs: [
      {
        ...k("s1"),
        label: t({ pl: "Jednostka główna", en: "Main unit" }),
        value: t({
          pl: "39 skrytek + ekran",
          en: "39 lockers + screen",
        }),
      },
      {
        ...k("s2"),
        label: t({
          pl: "Jednostka rozszerzająca",
          en: "Extension unit",
        }),
        value: t({ pl: "40 skrytek", en: "40 lockers" }),
      },
      {
        ...k("s3"),
        label: t({ pl: "Ekran", en: "Display" }),
        value: t({ pl: '21.5" dotykowy', en: '21.5" touchscreen' }),
      },
      {
        ...k("s4"),
        label: t({ pl: "Integracja", en: "Integration" }),
        value: t("API / Middleware"),
      },
    ],
    productHardwareLabel: t("Hardware"),
    productHardwareRows: [
      {
        ...k("hw1"),
        label: t({ pl: "Liczba skrytek", en: "Locker count" }),
        value: t({ pl: "od 3 do 320", en: "from 3 to 320" }),
      },
      {
        ...k("hw2"),
        label: t({ pl: "Ekran", en: "Screen" }),
        value: t({ pl: 'od 10" do 21.5"', en: 'from 10" to 21.5"' }),
      },
      {
        ...k("hw3"),
        label: t({ pl: "Kolory urządzeń", en: "Device colors" }),
        value: t({
          pl: "dowolne z palety RAL",
          en: "any from the RAL palette",
        }),
      },
      {
        ...k("hw6"),
        label: t({ pl: "Rozwiązania", en: "Solutions" }),
        value: t({ pl: "indoor i outdoor", en: "indoor and outdoor" }),
      },
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

    realizationsEyebrow: t({ pl: "Realizacje", en: "Realizations" }),
    realizationsHeadline: t({
      pl: "Współpracujemy z największymi markami.",
      en: "We partner with the biggest brands.",
    }),
    realizationsIntro: tt({
      pl: "PickUpWall wdrażany w salonach kosmetycznych, fashion i elektroniki.",
      en: "PickUpWall deployed in cosmetics, fashion and electronics stores.",
    }),
    realizationsCtaLabel: t({
      pl: "Zobacz wszystkie realizacje",
      en: "See all realizations",
    }),
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

    globalEyebrow: t({
      pl: "Wdrożenia w całej Europie",
      en: "Deployments across Europe",
    }),
    globalHeadline: t("GLOBAL"),
    globalIntro: tt(
      "Wdrożenia PickUpWall w wielu krajach. Skontaktuj się — pokażemy najbliższe.",
    ),
    globalCountriesLeft: [
      t({ pl: "Polska", en: "Poland" }),
      t({ pl: "Niemcy", en: "Germany" }),
      t({ pl: "Francja", en: "France" }),
      t({ pl: "Hiszpania", en: "Spain" }),
      t({ pl: "Włochy", en: "Italy" }),
      t({ pl: "Wielka Brytania", en: "United Kingdom" }),
    ],
    globalCountriesRight: [
      t({ pl: "Czechy", en: "Czech Republic" }),
      t({ pl: "Słowacja", en: "Slovakia" }),
      t({ pl: "Austria", en: "Austria" }),
      t({ pl: "Rumunia", en: "Romania" }),
      t({ pl: "Szwecja", en: "Sweden" }),
      t({ pl: "Holandia", en: "Netherlands" }),
    ],
    globalCtaToggleLabel: t({ pl: "Porozmawiajmy", en: "Let's talk" }),
    globalCtaTitle: t({ pl: "Napisz do nas", en: "Get in touch" }),
    globalCtaSubtitle: t({
      pl: "Odezwiemy się w ciągu 24h.",
      en: "We'll reply within 24h.",
    }),
    globalCtaNamePlaceholder: t({
      pl: "Imię i nazwisko",
      en: "Full name",
    }),
    globalCtaEmailPlaceholder: t({ pl: "E-mail", en: "Email" }),
    globalCtaMessagePlaceholder: t({
      pl: "Wiadomość...",
      en: "Message...",
    }),
    globalCtaSubmitLabel: t({ pl: "Wyślij", en: "Send" }),
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

  // ────────────────────────────────────────────────────────────────
  // Realizacje — upload zdjęć + utworzenie dokumentów.
  // Dane skopiowane z src/lib/realizations.ts (single-source-of-truth
  // przy następnej edycji: zmień w Sanity Studio).
  // ────────────────────────────────────────────────────────────────
  const REALIZATIONS = [
    {
      slug: "pickupwall-sephora",
      title: "PickUpWall Sephora",
      location: "Salon Sephora",
      description:
        "Wdrożenie PickUpWall w salonie Sephora — dedykowana grafika obudowy, integracja z platformą sprzedażową marki, obsługa Click & Collect dla zamówień internetowych.",
      image: "/realizacja-sephora.jpeg",
      client: "Sephora",
      year: 2025,
      integrationTime: "5 tygodni",
      lockers: 79,
    },
    {
      slug: "pickupwall-empik",
      title: "PickUpWall Empik",
      location: "Salon Empik",
      description:
        "Wdrożenie PickUpWall w salonie Empik — Click & Collect dla zamówień internetowych, integracja z platformą sprzedażową, dedykowana grafika obudowy w identyfikacji marki.",
      image: "/realizacja-wloclawek.jpg",
      client: "Empik",
      year: 2025,
      integrationTime: "5 tygodni",
      lockers: 79,
    },
    {
      slug: "pickupwall-milano",
      title: "PickUpWall Milano",
      location: "Vittorio Emanuele · Mediolan",
      description:
        "Instalacja w lokalizacji premium przy Vittorio Emanuele w Mediolanie. Master + Slave, integracja z systemem zamówień klienta.",
      image: "/realizacja-milano.jpg",
      client: "",
      year: 2024,
      integrationTime: "6 tygodni",
      lockers: 79,
    },
    {
      slug: "pickupwall-wloclawek",
      title: "PickUpWall Włocławek",
      location: "Pułaskiego · Włocławek",
      description:
        "Wdrożenie Click & Collect przy Pułaskiego we Włocławku. Standardowy układ Master + Slave, dedykowana grafika obudowy.",
      image: "/realizacja-wloclawek.jpg",
      client: "",
      year: 2023,
      integrationTime: "4 tygodnie",
      lockers: 79,
    },
    {
      slug: "pickupwall-2023",
      title: "PickUpWall Retail 2023",
      location: "Sklep stacjonarny",
      description:
        "Realizacja Click & Collect w punkcie sprzedaży z 2023 roku. Master + Slave, integracja API.",
      image: "/realizacja-photo-2023.jpg",
      client: "",
      year: 2023,
      integrationTime: "4 tygodnie",
      lockers: 79,
    },
    {
      slug: "pickupwall-click-collect",
      title: "PickUpWall Click & Collect",
      location: "Salon flagowy · Warszawa",
      description:
        "Pełne wdrożenie Click & Collect w salonie flagowym marki — moduł Master + Slave zintegrowany z platformą sprzedażową klienta, automatyczna obsługa odbioru zamówień internetowych i rezerwacji w sklepie.",
      image: "/clickcolect.jpeg",
      client: "",
      year: 2025,
      integrationTime: "5 tygodni",
      lockers: 79,
    },
    {
      slug: "pickupwall-warszawa",
      title: "PickUpWall Warszawa",
      location: "Punkt sprzedaży · Warszawa",
      description:
        "Wdrożenie Click & Collect w punkcie sprzedaży. Układ Master + Slave, 79 skrytek, ekran 21.5″ dotykowy.",
      image: "/realizacja-pickupwall.jpg",
      client: "",
      year: 2025,
      integrationTime: "4 tygodnie",
      lockers: 79,
    },
    {
      slug: "pickupwall-galeria",
      title: "PickUpWall Galeria",
      location: "Galeria handlowa",
      description:
        "Moduł w strefie wejściowej galerii. Master + Slave, integracja API z systemem zamówień klienta.",
      image: "/realizacja-pickupwall-2.jpg",
      client: "",
      year: 2025,
      integrationTime: "5 tygodni",
      lockers: 79,
    },
  ];

  console.log(`→ Upload zdjęć i seedowanie ${REALIZATIONS.length} realizacji…`);
  // Cache assetów żeby nie uploadować tego samego pliku dwa razy (np.
  // realizacja-wloclawek.jpg jest używany dwukrotnie).
  const assetCache = new Map();

  const uploadImage = async (relPath) => {
    if (assetCache.has(relPath)) return assetCache.get(relPath);
    const absPath = join(process.cwd(), "public", relPath.replace(/^\//, ""));
    if (!existsSync(absPath)) {
      console.warn(`  ✘ Brak pliku ${relPath} — pomijam.`);
      return null;
    }
    const buf = readFileSync(absPath);
    try {
      const asset = await client.assets.upload("image", buf, {
        filename: basename(absPath),
      });
      assetCache.set(relPath, asset._id);
      console.log(`  ✓ Upload: ${basename(absPath)}`);
      return asset._id;
    } catch (e) {
      console.warn(`  ✘ Upload ${relPath} nie powiódł się:`, e?.message ?? e);
      return null;
    }
  };

  for (const r of REALIZATIONS) {
    const assetId = await uploadImage(r.image);
    await client.createOrReplace({
      _id: `realization-${r.slug}`,
      _type: "realization",
      title: t(r.title),
      slug: { _type: "slug", current: r.slug },
      location: t(r.location),
      client: r.client || undefined,
      year: r.year,
      lockerCount: r.lockers,
      rolloutTime: t(r.integrationTime),
      summary: tt(r.description),
      story: tt(r.description),
      coverImage: assetId
        ? {
            _type: "image",
            asset: { _type: "reference", _ref: assetId },
          }
        : undefined,
      publishedAt: new Date(`${r.year}-01-01T00:00:00Z`).toISOString(),
    });
    console.log(`  ✓ Realizacja: ${r.title}`);
  }

  console.log("✓ Gotowe — sprawdź /studio.");
}

run().catch((err) => {
  console.error("✘ Seed failed:", err);
  process.exit(1);
});
