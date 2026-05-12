// Single source of truth for the realizations list — used by the homepage
// carousel (RealizationsSection), the /realizacje list page, and the
// /realizacje/[slug] detail page. When this moves to Sanity later, only
// the import paths change.

export type Realization = {
  slug: string;
  title: string;
  location: string;
  description: string;
  image: string;
  // Master + Slave config detail; nullable so future realizations with
  // bespoke wymiary fall through to the standard set.
  config?: {
    masterCount?: number; // ile modulow Master
    slaveCount?: number; // ile modulow Slave
    lockers?: number; // laczna liczba skrytek
    moduleDimensions?: string; // np. "1970 × 1025 × 50 mm"
    notes?: string;
  };
  client?: string;
  year?: number;
  integrationTime?: string;
};

// Default config that most installs share — referenced inline below for
// the Master+Slave standard so the data file stays DRY.
const STANDARD_CONFIG = {
  masterCount: 1,
  slaveCount: 1,
  lockers: 79,
  moduleDimensions: "1970 × 1025 × 50 mm",
  notes:
    "Standardowy uklad Master (39 skrytek + ekran) + Slave (40 skrytek, bez ekranu).",
} as const;

export const REALIZATIONS: Realization[] = [
  {
    slug: "pickupwall-click-collect",
    title: "PickUpWall Click & Collect",
    location: "Salon flagowy · Warszawa",
    description:
      "Pelne wdrozenie Click & Collect w salonie flagowym marki — modul Master + Slave zintegrowany z platforma sprzedazowa klienta, automatyczna obsluga odbioru zamowien internetowych i rezerwacji w sklepie.",
    image: "/clickcolect.jpeg",
    config: STANDARD_CONFIG,
    client: "—",
    year: 2025,
    integrationTime: "5 tygodni",
  },
  {
    slug: "pickupwall-warszawa",
    title: "PickUpWall Warszawa",
    location: "Punkt sprzedazy · Warszawa",
    description:
      "Wdrozenie Click & Collect w punkcie sprzedazy. Uklad Master + Slave, 79 skrytek, ekran 21.5″ dotykowy.",
    image: "/realizacja-pickupwall.jpg",
    config: STANDARD_CONFIG,
    client: "—",
    year: 2025,
    integrationTime: "4 tygodnie",
  },
  {
    slug: "pickupwall-galeria",
    title: "PickUpWall Galeria",
    location: "Galeria handlowa",
    description:
      "Modul w strefie wejsciowej galerii. Master + Slave, integracja API z systemem zamowien klienta.",
    image: "/realizacja-pickupwall-2.jpg",
    config: STANDARD_CONFIG,
    client: "—",
    year: 2025,
    integrationTime: "5 tygodni",
  },
  {
    slug: "pickupwall-biurowiec",
    title: "PickUpWall Biurowiec",
    location: "Biurowiec · Warszawa",
    description:
      "Wewnetrzny punkt odbioru paczek dla pracownikow. Master + Slave, dedykowana grafika obudowy.",
    image: "/realizacja-pickupwall.jpg",
    config: STANDARD_CONFIG,
    client: "—",
    year: 2024,
    integrationTime: "3 tygodnie",
  },
  {
    slug: "pickupwall-osiedle",
    title: "PickUpWall Osiedle",
    location: "Osiedle mieszkaniowe",
    description:
      "Calodobowy punkt odbioru przesylek na osiedlu. 2 × Slave dla zwiekszonego wolumenu.",
    image: "/realizacja-pickupwall-2.jpg",
    config: {
      masterCount: 1,
      slaveCount: 2,
      lockers: 119,
      moduleDimensions: "1970 × 1025 × 50 mm",
      notes: "Master + 2× Slave, calodobowy dostep.",
    },
    client: "—",
    year: 2024,
    integrationTime: "6 tygodni",
  },
  {
    slug: "pickupwall-pickup-store",
    title: "PickUpWall Pick up in store",
    location: "Sklep ecommerce",
    description:
      "Rozwiazanie do zamowien Click & Collect oraz odbioru zamowien internetowych w punkcie sprzedazy.",
    image: "/realizacja-pickupwall.jpg",
    config: STANDARD_CONFIG,
    client: "—",
    year: 2024,
    integrationTime: "4 tygodnie",
  },
  {
    slug: "pickupwall-retail",
    title: "PickUpWall Retail",
    location: "Sklep stacjonarny",
    description:
      "Modularna szafa w strefie kasowej. Wymiary modulu zgodne ze standardami zabudow meblowych w retailu.",
    image: "/realizacja-pickupwall-2.jpg",
    config: STANDARD_CONFIG,
    client: "—",
    year: 2024,
    integrationTime: "3 tygodnie",
  },
  {
    slug: "pickupwall-custom",
    title: "PickUpWall Custom",
    location: "Wersja dedykowana",
    description:
      "Niestandardowe wydanie pod konkretna zabudowe. Dedykowane wymiary, grafika i konfiguracja skrytek.",
    image: "/realizacja-pickupwall.jpg",
    config: {
      masterCount: 1,
      slaveCount: 3,
      lockers: 159,
      moduleDimensions: "wymiary custom",
      notes: "Wersja na specjalne zamowienie klienta.",
    },
    client: "—",
    year: 2025,
    integrationTime: "8 tygodni",
  },
];

export function getRealizationBySlug(slug: string): Realization | undefined {
  return REALIZATIONS.find((r) => r.slug === slug);
}

export function getNextRealizations(
  slug: string,
  count = 3,
): Realization[] {
  const i = REALIZATIONS.findIndex((r) => r.slug === slug);
  if (i === -1) return REALIZATIONS.slice(0, count);
  const out: Realization[] = [];
  for (let k = 1; k <= count; k++) {
    out.push(REALIZATIONS[(i + k) % REALIZATIONS.length]);
  }
  return out;
}
