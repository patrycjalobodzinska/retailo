import { sanityClient } from "./client";
import { createImageUrlBuilder } from "@sanity/image-url";
import {
  HOME_PAGE_QUERY,
  LANGUAGES_QUERY,
  NEXT_REALIZATIONS_QUERY,
  REALIZATIONS_LIST_QUERY,
  REALIZATIONS_PAGE_QUERY,
  REALIZATION_BY_SLUG_QUERY,
  SITE_SETTINGS_QUERY,
} from "./queries";
import type { LocalizedField } from "./i18n";
import { projectId, dataset } from "./env";
import { parseLockerMatrix, type LockerMatrix } from "@/lib/lockerMatrix";
import type { PortableTextBlock } from "@portabletext/types";

const builder = createImageUrlBuilder({ projectId, dataset });

// Tylko obrazy z podpiętym assetem da się zbudować — puste/„osierocone"
// obiekty image ({_type:'image'} bez asset) rzucają błędem w builderze
// (i wywalały prerender). Zwracamy dla nich "" i odfiltrowujemy dalej.
const hasAsset = (src: unknown): boolean =>
  !!src &&
  typeof src === "object" &&
  !!(src as { asset?: { _ref?: string } }).asset?._ref;

// Optymalizacja po stronie dostarczania (CDN Sanity): oryginał zostaje w
// storage, a do przeglądarki leci wariant przeskalowany, w AVIF/WebP i
// dociśnięty jakością. Dzięki temu nawet wielki upload klienta (np. 20 MB
// / 6000 px) ładuje się szybko — bez kompresji przy wrzucaniu.
//
// `fit("max")` = przeskaluj w dół do limitu, ale NIGDY w górę (małe zdjęcia
// zostają nietknięte). 1920 px wystarcza na pełnoekranowy hero i lightbox.
const MAX_W = 1920;
const QUALITY = 80;

const urlFor = (src: unknown) =>
  hasAsset(src)
    ? builder
        .image(src as never)
        .width(MAX_W)
        .fit("max")
        .auto("format")
        .quality(QUALITY)
        .url()
    : "";
// Kadr o stałych proporcjach wg punktu ostrości (hotspot) — daje spójne
// miniatury bez zależności od (nieistniejącego) wyboru proporcji w cropperze.
const urlForCrop = (src: unknown, w: number, h: number) =>
  hasAsset(src)
    ? builder
        .image(src as never)
        .width(w)
        .height(h)
        .fit("crop")
        .auto("format")
        .quality(QUALITY)
        .url()
    : "";

export type Language = {
  _id: string;
  code: string;
  name: string;
  isDefault?: boolean;
  order?: number;
};

export type SiteSettings = {
  logoText?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  siteUrl?: string;
  navigation?: Array<{
    href: string;
    label: LocalizedField;
  }>;
  ctaLabel?: LocalizedField;
  ctaHref?: string;
  footerTagline?: LocalizedField;
  footerEmail?: string;
  footerPhone?: string;
  footerAddress?: LocalizedField;
  footerCopyright?: LocalizedField;
  footerPrivacyLabel?: LocalizedField;
  footerTermsLabel?: LocalizedField;
} | null;

export type LocalizedItem = { title: LocalizedField; description: LocalizedField };

export type HomePage = {
  heroSubtitle?: LocalizedField;
  heroDescription?: LocalizedField;
  heroScrollLabel?: LocalizedField;
  heroBadges?: Array<{ value: LocalizedField; label: LocalizedField }>;
  heroInstallEyebrow?: LocalizedField;
  heroInstallTitle?: LocalizedField;
  heroInstallSubtitle?: LocalizedField;

  qaEyebrow?: LocalizedField;
  qaHeadline?: LocalizedField;
  qaSubtitle?: LocalizedField;
  qaTiles?: LocalizedItem[];

  productEyebrow?: LocalizedField;
  productHeadline?: LocalizedField;
  productFeatures?: LocalizedItem[];
  productBrandLabel?: LocalizedField;
  productBrandName?: LocalizedField;
  productSpecs?: Array<{ label: LocalizedField; value: LocalizedField }>;
  productBenefitsHeadline?: LocalizedField;
  productBenefits?: LocalizedItem[];
  productStepsLabel?: LocalizedField;
  productSpecsHeadline?: LocalizedField;
  productHardwareLabel?: LocalizedField;
  productHardwareMinLabel?: LocalizedField;
  productHardwareMaxLabel?: LocalizedField;
  productHardwareRows?: Array<{
    label: LocalizedField;
    min: string;
    max: string;
  }>;

  realizationsEyebrow?: LocalizedField;
  realizationsHeadline?: LocalizedField;
  realizationsIntro?: LocalizedField;
  realizationsCtaLabel?: LocalizedField;
  realizationsCtaHref?: string;
  realizationsSystemEyebrow?: LocalizedField;
  realizationsSystemHeadline?: LocalizedField;
  realizationsSystemItems?: LocalizedItem[];

  integrationEyebrow?: LocalizedField;
  integrationHeadline?: LocalizedField;
  integrationIntro?: LocalizedField;
  integrationItems?: LocalizedItem[];

  globalEyebrow?: LocalizedField;
  globalHeadline?: LocalizedField;
  globalIntro?: LocalizedField;
  globalCountriesLeft?: LocalizedField[];
  globalCountriesRight?: LocalizedField[];
  // Kody ISO_A2 krajów podświetlanych na globie (override domyślnej listy).
  globalMapCountries?: string[];
  globalCtaToggleLabel?: LocalizedField;
  globalCtaTitle?: LocalizedField;
  globalCtaSubtitle?: LocalizedField;
  globalCtaNamePlaceholder?: LocalizedField;
  globalCtaEmailPlaceholder?: LocalizedField;
  globalCtaMessagePlaceholder?: LocalizedField;
  globalCtaSubmitLabel?: LocalizedField;
} | null;

// Sanity content rarely changes mid-day; one-hour cache trades freshness
// for far fewer cold fetches blocking SSR (was 60s → frequent server-side
// waits on hard refresh, which delayed the hero animation).
const fetchOpts = {
  next: { revalidate: 3600 } as const,
};

export async function getLanguages(): Promise<Language[]> {
  return sanityClient.fetch<Language[]>(LANGUAGES_QUERY, {}, fetchOpts);
}

export async function getDefaultLanguage(): Promise<string> {
  const langs = await getLanguages();
  return langs.find((l) => l.isDefault)?.code ?? langs[0]?.code ?? "pl";
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return sanityClient.fetch<SiteSettings>(SITE_SETTINGS_QUERY, {}, fetchOpts);
}

export async function getHomePage(): Promise<HomePage> {
  return sanityClient.fetch<HomePage>(HOME_PAGE_QUERY, {}, fetchOpts);
}

export async function getRealizationsPage() {
  return sanityClient.fetch(REALIZATIONS_PAGE_QUERY, {}, fetchOpts);
}

// Płaski typ Realization używany przez RealizationsCarousel, listę
// /realizacje i detal /realizacje/[slug]. Zlokalizowane pola Sanity
// (LocalizedField) zostawiamy do resolve'owania na kliencie via useLang.
export type Realization = {
  slug: string;
  title: string;
  location: string;
  description: string;
  image: string;
  gallery?: { src: string; thumb: string }[];
  client?: string;
  year?: number;
  // Własne wiersze tabeli „Dane wdrożenia" (per realizacja).
  specs?: { label: string; value: string }[];
  // Opcjonalny opis (rich text / Portable Text) pod schematem i tabelą.
  body?: PortableTextBlock[];
  config?: {
    lockers?: number;
    masterCount?: number;
    slaveCount?: number;
    moduleDimensions?: string;
    notes?: string;
  };
  // Konfiguracja ściany złożona z modeli (lockerModule) — w kolejności.
  // Każdy moduł ma sparsowaną macierz układu skrytek.
  modules?: RealizationModule[];
  // Promowane realizacje renderowane są jako większe karty na liście.
  featured?: boolean;
  tags?: string[];
};

export type RealizationModule = {
  id: string;
  title: string;
  accent: string;
  lockers?: number;
  matrix: LockerMatrix;
};

// Pomocnik wyciągania pierwszego tłumaczenia z LocalizedField — używany
// po stronie serwera, bo komponenty konsumujące oczekują plain string.
type LocalizedRaw = {
  translations?: { value?: string; language?: { code?: string } }[];
};
const pickString = (f: unknown, preferCode = "pl"): string => {
  const t = (f as LocalizedRaw | undefined)?.translations ?? [];
  const exact = t.find((x) => x?.language?.code === preferCode)?.value;
  return exact ?? t.find((x) => x?.value)?.value ?? "";
};

type SanityRealizationRaw = {
  slug?: string;
  title?: LocalizedField;
  location?: LocalizedField;
  summary?: LocalizedField;
  client?: string;
  year?: number;
  lockerCount?: number;
  specs?: { label?: string; value?: string }[];
  body?: PortableTextBlock[];
  masterCount?: number;
  slaveCount?: number;
  featured?: boolean;
  modules?: Array<{
    id?: string;
    title?: string;
    accent?: string;
    lockers?: number;
    matrix?: string;
  }>;
  coverImage?: unknown;
  gallery?: unknown[];
};

const normalize = (r: SanityRealizationRaw): Realization => ({
  slug: r.slug ?? "",
  title: pickString(r.title),
  location: pickString(r.location),
  description: pickString(r.summary),
  image: r.coverImage ? urlFor(r.coverImage) : "",
  gallery: (r.gallery ?? [])
    .filter((g) => g && typeof g === "object")
    .map((g) => ({ src: urlFor(g), thumb: urlForCrop(g, 900, 675) }))
    .filter((g) => Boolean(g.src)),
  client: r.client,
  year: r.year,
  specs: (r.specs ?? [])
    .filter((s) => s?.label && s?.value)
    .map((s) => ({ label: s.label as string, value: s.value as string })),
  body: r.body,
  // Konfiguracja Master/Slave do schematu na stronie detalu. Domyślnie
  // standardowy układ 1× Master + 1× Slave (79 skrytek) — tak jak każda
  // realizacja miała wcześniej; Sanity może to nadpisać per realizacja.
  config: {
    lockers: r.lockerCount ?? 79,
    masterCount: r.masterCount ?? 1,
    slaveCount: r.slaveCount ?? 1,
    moduleDimensions: "1970 × 1025 × 50 mm",
  },
  featured: r.featured ?? false,
  modules:
    r.modules && r.modules.length > 0
      ? r.modules.map((m, i) => ({
          id: m.id ?? `module-${i}`,
          title: m.title ?? "Moduł",
          accent: m.accent || "#0086b0",
          lockers: m.lockers,
          matrix: parseLockerMatrix(m.matrix),
        }))
      : undefined,
});

export async function getRealizationsList(): Promise<Realization[]> {
  const raw = await sanityClient.fetch<SanityRealizationRaw[]>(
    REALIZATIONS_LIST_QUERY,
    {},
    fetchOpts,
  );
  return (raw ?? []).map(normalize);
}

export async function getRealizationBySlug(
  slug: string,
): Promise<Realization | null> {
  const raw = await sanityClient.fetch<SanityRealizationRaw | null>(
    REALIZATION_BY_SLUG_QUERY,
    { slug },
    fetchOpts,
  );
  return raw ? normalize(raw) : null;
}

export async function getNextRealizations(slug: string): Promise<Realization[]> {
  const raw = await sanityClient.fetch<SanityRealizationRaw[]>(
    NEXT_REALIZATIONS_QUERY,
    { slug },
    fetchOpts,
  );
  return (raw ?? []).map(normalize);
}
