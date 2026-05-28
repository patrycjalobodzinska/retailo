"use client";

import { NextIntlClientProvider } from "next-intl";
import { useMemo } from "react";
import { useLang } from "./LanguageProvider";
import plMessages from "../../../messages/pl.json";
import enMessages from "../../../messages/en.json";

/**
 * Most między istniejącym `LanguageProvider` (Sanity i18n) a `next-intl`.
 * Wybiera odpowiedni słownik komunikatów na podstawie aktualnego języka
 * z LanguageProvider'a — komponenty mogą używać `useTranslations()` z
 * `next-intl` dla statycznych UI stringów (np. nawigacja, button label,
 * placeholdery), a `useLang().t(field)` dla content'u z Sanity.
 *
 * Bundle: oba json'y są importowane statycznie (małe pliki ~3KB każdy).
 */

const MESSAGES_BY_LOCALE: Record<string, Record<string, unknown>> = {
  pl: plMessages,
  en: enMessages,
};

export function IntlBridge({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const locale = MESSAGES_BY_LOCALE[lang] ? lang : "pl";
  const messages = useMemo(
    () => MESSAGES_BY_LOCALE[locale] ?? MESSAGES_BY_LOCALE.pl,
    [locale],
  );

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Europe/Warsaw">
      {children}
    </NextIntlClientProvider>
  );
}
