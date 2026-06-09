"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { SiteSettings } from "@/lib/sanity/fetch";

const GA_ID = "G-YHPVXVF8K6";
const STORAGE_KEY = "retailo_cookie_consent_v1";
export const OPEN_COOKIE_SETTINGS_EVENT = "retailo:open-cookie-settings";

type Consent = {
  analytics: boolean;
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
  }
  return consent;
}

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

const BTN_BASE =
  "flex-1 cursor-pointer rounded-full px-3 py-2 text-center text-xs font-semibold whitespace-nowrap transition duration-200 hover:-translate-y-0.5 sm:flex-none sm:px-5 sm:py-2.5 sm:text-sm";
const BTN_PRIMARY = `${BTN_BASE} bg-[#007293] text-white shadow-[0_2px_10px_rgba(0,114,147,0.3)] hover:bg-[#0a2a2e] hover:shadow-[0_4px_14px_rgba(10,42,46,0.3)]`;
const BTN_REJECT = `${BTN_BASE} bg-white/30 text-[#0a2a2e]/80 hover:bg-white/60 hover:text-[#0a2a2e]`;
const BTN_SECONDARY = `${BTN_BASE} border border-[#0a2a2e]/15 bg-white/40 text-[#0a2a2e] hover:border-[#0a2a2e]/35 hover:bg-white/70`;

export default function CookieConsent({
  settings,
}: {
  settings?: SiteSettings;
}) {
  const { t } = useLang();
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent | null>(null);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

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
      t(settings?.cookieNecessaryTitle ?? null) || "Niezbędne - zawsze aktywne",
    necessaryDesc:
      t(settings?.cookieNecessaryDesc ?? null) ||
      "Wymagane do działania strony (np. zapamiętanie Twojej decyzji o cookies). Nie zbierają danych do analityki ani marketingu.",
    analyticsTitle:
      t(settings?.cookieAnalyticsTitle ?? null) ||
      "Analityczne (Google Analytics)",
    analyticsDesc:
      t(settings?.cookieAnalyticsDesc ?? null) ||
      "Anonimowe statystyki odwiedzin (Google Analytics 4) - pomagają nam ulepszać stronę. Dane mogą być przekazywane do Google LLC. Włączane dopiero po Twojej zgodzie.",
    privacyLabel:
      t(settings?.footerPrivacyLabel ?? null) || "Polityce prywatności",
  };

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    if (stored) {
      setBannerOpen(false);
      setAnalyticsChecked(stored.analytics);
      document.documentElement.removeAttribute("data-cookie-pending");
    } else {
      document.documentElement.setAttribute("data-cookie-pending", "");
    }

    const reopen = () => {
      const current = readConsent();
      setAnalyticsChecked(current?.analytics ?? false);
      setSettingsOpen(true);
      setBannerOpen(true);
      document.documentElement.setAttribute("data-cookie-pending", "");
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!bannerOpen || !isMobile) return;
    const dialog = dialogRef.current;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    dialog?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled])",
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialog)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.removeEventListener("keydown", trap);
      prevFocus?.focus?.();
    };
  }, [bannerOpen, isMobile]);

  const decide = useCallback(
    (analytics: boolean) => {
      const hadAnalytics = consent?.analytics === true;
      const next = saveConsent(analytics);
      setConsent(next);
      setBannerOpen(false);
      setSettingsOpen(false);
      document.documentElement.removeAttribute("data-cookie-pending");
      // Consent Mode v2: aktualizujemy zgodę na żywo (bez przeładowania).
      const w = window as unknown as {
        gtag?: (...args: unknown[]) => void;
      };
      w.gtag?.("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: analytics ? "granted" : "denied",
      });
      if (hadAnalytics && !analytics) {
        clearGaCookies();
      }
    },
    [consent],
  );

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* Consent Mode v2: gtag.js ładuje się zawsze (tag wykrywalny przez
          Google), ale faktyczne zbieranie zależy od domyślnej zgody ustawionej
          w <head> (denied) i aktualizacji w decide(). */}
      <GoogleAnalytics gaId={GA_ID} />

      {bannerOpen && (
        <>
          <div
            aria-hidden
            data-cookie-consent
            className="fixed inset-0 z-[199] bg-[#0a2a2e]/55 backdrop-blur-[2px] sm:hidden"
          />
          <div
            ref={dialogRef}
            data-cookie-consent
            role="dialog"
            aria-modal={isMobile}
            aria-label={settingsOpen ? txt.settingsTitle : txt.title}
            tabIndex={-1}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 outline-none sm:inset-auto sm:right-4 sm:bottom-4 sm:block sm:w-[calc(100vw-32px)] sm:max-w-[480px] sm:p-0"
          >
            <div className="cookie-banner-in w-full max-w-[480px] rounded-3xl border border-white/60 bg-gradient-to-br from-[#fafaf8] via-[#f2ece1] to-[#e3dbcb] p-5 text-[#0a2a2e] shadow-[0_18px_50px_-12px_rgba(10,42,46,0.35)] ring-1 ring-[#0a2a2e]/5 backdrop-blur-xl sm:from-[#fafaf8]/85 sm:via-[#f2ece1]/80 sm:to-[#e3dbcb]/75 sm:p-6">
              {!settingsOpen ? (
                <>
                  <h2 className="m-0 mb-2 flex items-center gap-2 text-base font-semibold tracking-tight">
                    <span aria-hidden className="text-lg leading-none">
                      🍪
                    </span>
                    {txt.title}
                  </h2>
                  <p className="m-0 mb-4 text-[13px] leading-relaxed text-[#0a2a2e]/75">
                    {txt.text} Szczegóły w{" "}
                    <Link
                      href="/polityka-prywatnosci"
                      className="text-[#00607f] underline underline-offset-2"
                    >
                      {txt.privacyLabel}
                    </Link>
                    .
                  </p>
                  <div className="flex items-center gap-1.5 sm:flex-wrap sm:gap-2.5">
                    <button
                      type="button"
                      onClick={() => decide(true)}
                      className={BTN_PRIMARY}
                    >
                      {txt.accept}
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(false)}
                      className={BTN_REJECT}
                    >
                      {txt.reject}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(true)}
                      className={BTN_SECONDARY}
                    >
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
                    <label className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/40 p-3.5">
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
                        <span className="block text-xs leading-relaxed text-[#0a2a2e]/75">
                          {txt.necessaryDesc}
                        </span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/60 bg-white/40 p-3.5">
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
                        <span className="block text-xs leading-relaxed text-[#0a2a2e]/75">
                          {txt.analyticsDesc}
                        </span>
                      </span>
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5 sm:flex-wrap sm:gap-2.5">
                    <button
                      type="button"
                      onClick={() => decide(analyticsChecked)}
                      className={BTN_PRIMARY}
                    >
                      {txt.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(false)}
                      className={BTN_REJECT}
                    >
                      {txt.reject}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

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
      className={`cursor-pointer ${className ?? ""}`}
    >
      {label || "Ustawienia cookies"}
    </button>
  );
}
