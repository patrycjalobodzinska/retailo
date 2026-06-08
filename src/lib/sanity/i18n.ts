
export type LocalizedField = {
  translations?: Array<{
    language?: { code?: string } | null;
    value?: string | null;
  }> | null;
} | null;

export function resolveLocalized(
  field: LocalizedField,
  lang: string,
  defaultLang = "pl",
): string {
  const translations = field?.translations ?? [];
  const exact = translations.find((t) => t?.language?.code === lang);
  if (exact?.value) return exact.value;

  const fallback = translations.find((t) => t?.language?.code === defaultLang);
  if (fallback?.value) return fallback.value;

  const first = translations.find((t) => t?.value)?.value;
  return first ?? "";
}
