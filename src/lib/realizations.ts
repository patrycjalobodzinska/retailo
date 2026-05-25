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
  tags?: string[];
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
    slug: "pickupwall-sephora",
    title: "PickUpWall Sephora",
    location: "Salon Sephora",
    description:
      "Wdrozenie PickUpWall w salonie Sephora — dedykowana grafika obudowy, integracja z platforma sprzedazowa marki, obsluga Click & Collect dla zamowien internetowych.",
    image: "/realizacja-sephora.jpeg",
    config: STANDARD_CONFIG,
    client: "Sephora",
    year: 2025,
    integrationTime: "5 tygodni",
    tags: ["Click & Collect", "API", "Master + Slave"],
  },
  {
    slug: "pickupwall-empik",
    title: "PickUpWall Empik",
    location: "Salon Empik",
    description:
      "Wdrozenie PickUpWall w salonie Empik — Click & Collect dla zamowien internetowych, integracja z platforma sprzedazowa, dedykowana grafika obudowy w identyfikacji marki.",
    image: "/realizacja-wloclawek.jpg",
    config: STANDARD_CONFIG,
    client: "Empik",
    year: 2025,
    integrationTime: "5 tygodni",
    tags: ["Click & Collect", "Brand graphic", "Master + Slave"],
  },
  {
    slug: "pickupwall-milano",
    title: "PickUpWall Milano",
    location: "Vittorio Emanuele · Mediolan",
    description:
      "Instalacja w lokalizacji premium przy Vittorio Emanuele w Mediolanie. Master + Slave, integracja z systemem zamowien klienta.",
    image: "/realizacja-milano.jpg",
    config: STANDARD_CONFIG,
    client: "—",
    year: 2024,
    integrationTime: "6 tygodni",
    tags: ["Premium", "API"],
  },
  {
    slug: "pickupwall-wloclawek",
    title: "PickUpWall Wloclawek",
    location: "Pulaskiego · Wloclawek",
    description:
      "Wdrozenie Click & Collect przy Pulaskiego we Wloclawku. Standardowy uklad Master + Slave, dedykowana grafika obudowy.",
    image: "/realizacja-wloclawek.jpg",
    config: STANDARD_CONFIG,
    client: "—",
    year: 2023,
    integrationTime: "4 tygodnie",
  },
  {
    slug: "pickupwall-2023",
    title: "PickUpWall Retail 2023",
    location: "Sklep stacjonarny",
    description:
      "Realizacja Click & Collect w punkcie sprzedazy z 2023 roku. Master + Slave, integracja API.",
    image: "/realizacja-photo-2023.jpg",
    config: STANDARD_CONFIG,
    client: "—",
    year: 2023,
    integrationTime: "4 tygodnie",
  },
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
