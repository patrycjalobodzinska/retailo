import { sanityClient } from "./client";
import imageUrlBuilder from "@sanity/image-url";
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

const builder = imageUrlBuilder({ projectId, dataset });
const urlFor = (src: unknown) => builder.image(src as never).url();

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
  client?: string;
  year?: number;
  integrationTime?: string;
  config?: {
    lockers?: number;
    masterCount?: number;
    slaveCount?: number;
    moduleDimensions?: string;
    notes?: string;
  };
  tags?: string[];
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
  story?: LocalizedField;
  client?: string;
  year?: number;
  lockerCount?: number;
  rolloutTime?: LocalizedField;
  coverImage?: unknown;
};

const normalize = (r: SanityRealizationRaw): Realization => ({
  slug: r.slug ?? "",
  title: pickString(r.title),
  location: pickString(r.location),
  description: pickString(r.summary) || pickString(r.story),
  image: r.coverImage ? urlFor(r.coverImage) : "",
  client: r.client,
  year: r.year,
  integrationTime: pickString(r.rolloutTime),
  config: r.lockerCount ? { lockers: r.lockerCount } : undefined,
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
