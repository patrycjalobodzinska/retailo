import { sanityClient } from "./client";
import { createImageUrlBuilder } from "@sanity/image-url";
import {
  HOME_PAGE_QUERY,
  LANGUAGES_QUERY,
  LEGAL_PAGE_QUERY,
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

const hasAsset = (src: unknown): boolean =>
  !!src &&
  typeof src === "object" &&
  !!(src as { asset?: { _ref?: string } }).asset?._ref;

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
  cookieTitle?: LocalizedField;
  cookieText?: LocalizedField;
  cookieAcceptLabel?: LocalizedField;
  cookieRejectLabel?: LocalizedField;
  cookieCustomizeLabel?: LocalizedField;
  cookieSaveLabel?: LocalizedField;
  cookieSettingsTitle?: LocalizedField;
  cookieNecessaryTitle?: LocalizedField;
  cookieNecessaryDesc?: LocalizedField;
  cookieAnalyticsTitle?: LocalizedField;
  cookieAnalyticsDesc?: LocalizedField;
  cookieSettingsLinkLabel?: LocalizedField;
} | null;

export type LocalizedBlocks = {
  translations?: Array<{
    language?: { code?: string } | null;
    value?: PortableTextBlock[] | null;
  }> | null;
} | null;

export type LegalPage = {
  slug?: string;
  title?: LocalizedField;
  effectiveDate?: LocalizedField;
  body?: LocalizedBlocks;
} | null;

export type LocalizedItem = { title: LocalizedField; description: LocalizedField };

export type HomePage = {
  heroImage?: string;
  heroInstallImage?: string;
  heroSubtitle?: LocalizedField;
  heroDescription?: LocalizedField;
  heroScrollLabel?: LocalizedField;
  heroBadges?: Array<{ value: LocalizedField; label: LocalizedField }>;
  heroInstallEyebrow?: LocalizedField;
  heroInstallTitle?: LocalizedField;
  heroInstallSubtitle?: LocalizedField;

  qaClientLogo?: string;
  qaEyebrow?: LocalizedField;
  qaHeadline?: LocalizedField;
  qaSubtitle?: LocalizedField;
  qaTiles?: LocalizedItem[];

  productPhoto?: string;
  productSketch?: string;
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
  productHardwareRows?: Array<{
    label: LocalizedField;
    value: LocalizedField;
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
  globalMapCountries?: string[];
  globalCtaToggleLabel?: LocalizedField;
  globalCtaTitle?: LocalizedField;
  globalCtaSubtitle?: LocalizedField;
  globalCtaNamePlaceholder?: LocalizedField;
  globalCtaEmailPlaceholder?: LocalizedField;
  globalCtaMessagePlaceholder?: LocalizedField;
  globalCtaSubmitLabel?: LocalizedField;

  modelsVisible?: boolean;
  modelsHeadline?: LocalizedField;
  models?: Array<{
    name?: LocalizedField;
    description?: LocalizedField;
    image?: string;
    featured?: boolean;
  }>;
} | null;

const fetchOpts = {
  next: {
    revalidate: process.env.NODE_ENV === "development" ? 0 : 3600,
  } as const,
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
  // Treść strony głównej jest podzielona na osobne dokumenty sekcji
  // (homeHero, homeQa, ...). Łączymy je w jeden płaski obiekt HomePage,
  // żeby komponenty nie wymagały zmian.
  const r = await sanityClient.fetch<Record<string, object | null>>(
    HOME_PAGE_QUERY,
    {},
    fetchOpts,
  );
  if (!r) return null;
  return {
    ...(r.hero ?? {}),
    ...(r.qa ?? {}),
    ...(r.product ?? {}),
    ...(r.realizations ?? {}),
    ...(r.integration ?? {}),
    ...(r.models ?? {}),
    ...(r.global ?? {}),
  } as HomePage;
}

export async function getRealizationsPage() {
  return sanityClient.fetch(REALIZATIONS_PAGE_QUERY, {}, fetchOpts);
}

export async function getLegalPage(slug: string): Promise<LegalPage> {
  return sanityClient.fetch<LegalPage>(LEGAL_PAGE_QUERY, { slug }, fetchOpts);
}

export type Realization = {
  slug: string;
  title: string;
  location: string;
  description: string;
  image: string;
  gallery?: { src: string; thumb: string }[];
  client?: string;
  year?: number;
  specs?: { label: string; value: string }[];
  body?: PortableTextBlock[];
  config?: {
    lockers?: number;
    masterCount?: number;
    slaveCount?: number;
    notes?: string;
  };
  modules?: RealizationModule[];
  devices?: RealizationDevice[];
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

export type RealizationDevice = {
  label?: string;
  modules: RealizationModule[];
};

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
  specs?: { label?: LocalizedField; value?: LocalizedField }[];
  body?: PortableTextBlock[];
  masterCount?: number;
  slaveCount?: number;
  featured?: boolean;
  modules?: Array<RawModule>;
  devices?: Array<{ label?: string; modules?: Array<RawModule> }>;
  coverImage?: unknown;
  gallery?: unknown[];
};

type RawModule = {
  id?: string;
  title?: string;
  accent?: string;
  lockers?: number;
  matrix?: string;
};

const mapModule = (m: RawModule, fallbackId: string): RealizationModule => ({
  id: m.id ?? fallbackId,
  title: m.title ?? "Moduł",
  accent: m.accent || "#0086b0",
  lockers: m.lockers,
  matrix: parseLockerMatrix(m.matrix),
});

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
    .map((s) => ({ label: pickString(s?.label), value: pickString(s?.value) }))
    .filter((s) => s.label && s.value),
  body: r.body,
  config: {
    lockers: r.lockerCount ?? 79,
    masterCount: r.masterCount ?? 1,
    slaveCount: r.slaveCount ?? 1,
  },
  featured: r.featured ?? false,
  modules:
    r.modules && r.modules.length > 0
      ? r.modules.map((m, i) => mapModule(m, `module-${i}`))
      : undefined,
  devices:
    r.devices && r.devices.length > 0
      ? r.devices
          .map((d, di) => ({
            label: d.label,
            modules: (d.modules ?? []).map((m, i) =>
              mapModule(m, `device-${di}-module-${i}`),
            ),
          }))
          .filter((d) => d.modules.length > 0)
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
