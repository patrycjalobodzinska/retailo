import { sanityClient } from "./client";
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

export async function getRealizationsList() {
  return sanityClient.fetch(REALIZATIONS_LIST_QUERY, {}, fetchOpts);
}

export async function getRealizationBySlug(slug: string) {
  return sanityClient.fetch(REALIZATION_BY_SLUG_QUERY, { slug }, fetchOpts);
}

export async function getNextRealizations(slug: string) {
  return sanityClient.fetch(NEXT_REALIZATIONS_QUERY, { slug }, fetchOpts);
}
