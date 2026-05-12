/**
 * Resolve a localized field (`localizedString` / `localizedText`) to a plain
 * string, given the current language code and a default fallback.
 *
 * Storage shape (from Sanity):
 *   {
 *     translations: [
 *       { language: { code: "pl" }, value: "Tekst po polsku" },
 *       { language: { code: "en" }, value: "Text in English" },
 *     ]
 *   }
 *
 * Resolution order:
 *   1. exact match on `lang`
 *   2. fallback to `defaultLang`
 *   3. first non-empty value
 *   4. empty string
 */

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
