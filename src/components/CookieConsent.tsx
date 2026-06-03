"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { SiteSettings } from "@/lib/sanity/fetch";

const GA_ID = "G-EXF68478GE";
const STORAGE_KEY = "retailo_cookie_consent_v1";
/** Event otwierający panel ustawień (np. z linku w stopce). */
export const OPEN_COOKIE_SETTINGS_EVENT = "retailo:open-cookie-settings";

type Consent = {
  analytics: boolean;
  /** Timestamp decyzji — dowód zgody (RODO art. 7 ust. 1). */
  decidedAt: string;
};

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics !== "boolean") return null;
    return parsed as Consent;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean): Consent {
  const consent: Consent = {
    analytics,
    decidedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    /* noop — np. tryb prywatny */
  }
  return consent;
}

/** Usuwa cookies Google Analytics po cofnięciu zgody. */
function clearGaCookies() {
  const cookies = document.cookie.split(";");
  for (const c of cookies) {
    const name = c.split("=")[0]?.trim();
    if (!name) continue;
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid") {
      const domain = location.hostname.replace(/^www\./, "");
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
    }
  }
}

const BTN_PRIMARY =
  "cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0a2a2e] transition hover:bg-[#7ed5e6]";
const BTN_SECONDARY =
  "cursor-pointer rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/50";

/**
 * Baner zgody na cookies zgodny z RODO / ustawą Prawo komunikacji
 * elektronicznej:
 * - żaden skrypt analityczny nie ładuje się przed wyrażeniem zgody,
 * - „Odrzucam" jest tak samo wyeksponowane jak „Akceptuję",
 * - granularny wybór kategorii (niezbędne / analityczne), bez domyślnych
 *   zaznaczeń,
 * - zgodę można cofnąć w każdej chwili (link „Ustawienia cookies" w stopce
 *   wysyła OPEN_COOKIE_SETTINGS_EVENT).
 * Google Analytics montuje się wyłącznie po zgodzie, z Consent Mode v2
 * (sygnały reklamowe zawsze denied — nie używamy Google Ads).
 * Treści edytowalne w Sanity (siteSettings, pola cookie*), z fallbackami PL.
 */
export default function CookieConsent({
  settings,
}: {
  settings?: SiteSettings;
}) {
  const { t } = useLang();
  const [consent, setConsent] = useState<Consent | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);

  const txt = {
    title: t(settings?.cookieTitle ?? null) || "Szanujemy Twoją prywatność",
    text:
      t(settings?.cookieText ?? null) ||
      "Używamy niezbędnych plików cookies, aby strona działała poprawnie. Za Twoją zgodą użyjemy także cookies analitycznych (Google Analytics), aby zrozumieć, jak korzystasz z serwisu. Zgodę możesz wycofać w każdej chwili.",
    accept: t(settings?.cookieAcceptLabel ?? null) || "Akceptuję wszystkie",
    reject: t(settings?.cookieRejectLabel ?? null) || "Odrzucam",
    customize: t(settings?.cookieCustomizeLabel ?? null) || "Dostosuj",
    save: t(settings?.cookieSaveLabel ?? null) || "Zapisz wybór",
    settingsTitle:
      t(settings?.cookieSettingsTitle ?? null) || "Ustawienia cookies",
    necessaryTitle:
      t(settings?.cookieNecessaryTitle ?? null) ||
      "Niezbędne — zawsze aktywne",
    necessaryDesc:
      t(settings?.cookieNecessaryDesc ?? null) ||
      "Wymagane do działania strony (np. zapamiętanie Twojej decyzji o cookies). Nie zbierają danych do analityki ani marketingu.",
    analyticsTitle:
      t(settings?.cookieAnalyticsTitle ?? null) ||
      "Analityczne (Google Analytics)",
    analyticsDesc:
      t(settings?.cookieAnalyticsDesc ?? null) ||
      "Anonimowe statystyki odwiedzin (Google Analytics 4) — pomagają nam ulepszać stronę. Dane mogą być przekazywane do Google LLC. Włączane dopiero po Twojej zgodzie.",
    privacyLabel:
      t(settings?.footerPrivacyLabel ?? null) || "Polityce prywatności",
  };

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    if (!stored) setBannerOpen(true);
    else setAnalyticsChecked(stored.analytics);

    const reopen = () => {
      const current = readConsent();
      setAnalyticsChecked(current?.analytics ?? false);
      setSettingsOpen(true);
      setBannerOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  const decide = useCallback(
    (analytics: boolean) => {
      const hadAnalytics = consent?.analytics === true;
      const next = saveConsent(analytics);
      setConsent(next);
      setBannerOpen(false);
      setSettingsOpen(false);
      // Cofnięcie zgody: czyścimy cookies GA i przeładowujemy, żeby
      // załadowany już gtag przestał działać natychmiast.
      if (hadAnalytics && !analytics) {
        clearGaCookies();
        window.location.reload();
      }
    },
    [consent],
  );

  return (
    <>
      {/* GA tylko po zgodzie — wcześniej zero requestów do Google. */}
      {consent?.analytics && (
        <>
          <Script
            id="ga-consent-mode"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});`,
            }}
          />
          <GoogleAnalytics gaId={GA_ID} />
        </>
      )}

      {bannerOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={txt.settingsTitle}
          className="fixed inset-x-0 bottom-0 z-[200] p-3 sm:p-4">
          <div className="mx-auto max-w-[680px] rounded-2xl border border-white/15 bg-[#0a2a2e]/95 p-5 text-white shadow-2xl backdrop-blur-md sm:p-6">
            {!settingsOpen ? (
              <>
                <h2 className="m-0 mb-2 text-base font-semibold tracking-tight">
                  {txt.title}
                </h2>
                <p className="m-0 mb-4 text-[13px] leading-relaxed text-white/70">
                  {txt.text} Szczegóły w{" "}
                  <Link
                    href="/polityka-prywatnosci"
                    className="text-[#7ed5e6] underline underline-offset-2">
                    {txt.privacyLabel}
                  </Link>
                  .
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => decide(true)}
                    className={BTN_PRIMARY}>
                    {txt.accept}
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(false)}
                    className={BTN_PRIMARY}>
                    {txt.reject}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className={BTN_SECONDARY}>
                    {txt.customize}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="m-0 mb-3 text-base font-semibold tracking-tight">
                  {txt.settingsTitle}
                </h2>
                <div className="mb-4 flex flex-col gap-3">
                  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="mt-0.5 accent-[#0086b0]"
                    />
                    <span>
                      <span className="block text-[13px] font-semibold">
                        {txt.necessaryTitle}
                      </span>
                      <span className="block text-xs leading-relaxed text-white/60">
                        {txt.necessaryDesc}
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
                    <input
                      type="checkbox"
                      checked={analyticsChecked}
                      onChange={(e) => setAnalyticsChecked(e.target.checked)}
                      className="mt-0.5 cursor-pointer accent-[#0086b0]"
                    />
                    <span>
                      <span className="block text-[13px] font-semibold">
                        {txt.analyticsTitle}
                      </span>
                      <span className="block text-xs leading-relaxed text-white/60">
                        {txt.analyticsDesc}
                      </span>
                    </span>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => decide(analyticsChecked)}
                    className={BTN_PRIMARY}>
                    {txt.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(false)}
                    className={BTN_SECONDARY}>
                    {txt.reject}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/** Link/przycisk do stopki — otwiera panel ustawień cookies. */
export function CookieSettingsLink({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
      }
      className={`cursor-pointer ${className ?? ""}`}>
      {label || "Ustawienia cookies"}
    </button>
  );
}
