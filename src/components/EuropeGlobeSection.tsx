"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { CookieSettingsLink } from "@/components/CookieConsent";
import type { HomePage, SiteSettings } from "@/lib/sanity/fetch";

gsap.registerPlugin(ScrollTrigger);

const EuropeGlobeInner = dynamic(() => import("./EuropeGlobeInner"), {
  ssr: false,
});
const StaticGlobe = dynamic(() => import("./StaticGlobe"), { ssr: false });

// Flaga po nazwie kraju (PL i EN), niezależnie od kolejności / języka.
const FLAG_BY_NAME: Record<string, string> = {
  Polska: "🇵🇱", Poland: "🇵🇱",
  Niemcy: "🇩🇪", Germany: "🇩🇪",
  Hiszpania: "🇪🇸", Spain: "🇪🇸",
  Włochy: "🇮🇹", Wlochy: "🇮🇹", Italy: "🇮🇹",
  Czechy: "🇨🇿", Czechia: "🇨🇿",
  Szwecja: "🇸🇪", Sweden: "🇸🇪",
  Dania: "🇩🇰", Denmark: "🇩🇰",
  Turcja: "🇹🇷", Turkey: "🇹🇷",
  Francja: "🇫🇷", France: "🇫🇷",
  "Wielka Brytania": "🇬🇧", "United Kingdom": "🇬🇧",
  Słowacja: "🇸🇰", Slowacja: "🇸🇰", Slovakia: "🇸🇰",
  Austria: "🇦🇹",
  Rumunia: "🇷🇴", Romania: "🇷🇴",
  Holandia: "🇳🇱", Netherlands: "🇳🇱",
};
const LEFT_COUNTRIES_FALLBACK = ["Polska", "Niemcy", "Hiszpania", "Włochy"];
const RIGHT_COUNTRIES_FALLBACK = ["Czechy", "Szwecja", "Dania", "Turcja"];

const SECTION_SCROLL_VH = 130;
const FOOTER_REVEAL_DELAY = 0.6;
const FOOTER_REVEAL_DURATION = 0.9;
const COUNTRY_SCROLL_PROGRESS = 0.18;
const COUNTRY_STAGGER_SEC = 0.12;
const COUNTRY_ITEM_DURATION = 0.78;

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xojzdpep";

export default function EuropeGlobeSection({
  data,
  settings,
  webGlobeOnMobile = false,
}: {
  data?: HomePage;
  settings?: SiteSettings;
  webGlobeOnMobile?: boolean;
} = {}) {
  const { t } = useLang();
  const eyebrow = t(data?.globalEyebrow ?? null) || "Wdrozenia w calej Europie";
  const headline = t(data?.globalHeadline ?? null) || "GLOBAL";
  const intro = t(data?.globalIntro ?? null) || "";
  const ctaToggleLabel =
    t(data?.globalCtaToggleLabel ?? null) || "Porozmawiajmy";
  const ctaTitle = t(data?.globalCtaTitle ?? null) || "Napisz do nas";
  const ctaSubtitle =
    t(data?.globalCtaSubtitle ?? null) || "Odezwiemy się w ciągu 24h.";
  const ctaName =
    t(data?.globalCtaNamePlaceholder ?? null) || "Imię i nazwisko";
  const ctaEmail = t(data?.globalCtaEmailPlaceholder ?? null) || "E-mail";
  const ctaMessage =
    t(data?.globalCtaMessagePlaceholder ?? null) || "Wiadomość...";
  const ctaSubmit = t(data?.globalCtaSubmitLabel ?? null) || "Wyślij";
  const footerTagline =
    t(settings?.footerTagline ?? null) || "Automaty paczkowe";
  const footerCopyright =
    t(settings?.footerCopyright ?? null) || "© 2026 retailo";
  const footerPrivacyLabel =
    t(settings?.footerPrivacyLabel ?? null) || "Polityka prywatności";

  const toCountry = (name: string) => ({
    flag: FLAG_BY_NAME[name.trim()] ?? "🏳",
    name,
  });
  // Kolumny krajów z Sanity (z fallbackiem, gdy puste). Render używa właśnie
  // tych list - flaga dobierana po nazwie, więc kolejność nie ma znaczenia.
  const leftCountriesList = (
    data?.globalCountriesLeft?.length
      ? data.globalCountriesLeft.map((f) => t(f) || "")
      : LEFT_COUNTRIES_FALLBACK
  )
    .filter(Boolean)
    .map(toCountry);
  const rightCountriesList = (
    data?.globalCountriesRight?.length
      ? data.globalCountriesRight.map((f) => t(f) || "")
      : RIGHT_COUNTRIES_FALLBACK
  )
    .filter(Boolean)
    .map(toCountry);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const bigTextRef = useRef<HTMLDivElement>(null);
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [mobileCtaOpen, setMobileCtaOpen] = useState(false);
  const [ctaStatus, setCtaStatus] = useState<
    "idle" | "sending" | "ok" | "error"
  >("idle");

  const handleCtaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setCtaStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (res.ok) {
        setCtaStatus("ok");
        form.reset();
      } else {
        setCtaStatus("error");
      }
    } catch {
      setCtaStatus("error");
    }
  };
  const [isMobile, setIsMobile] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    const update = () =>
      setIsMobile(window.matchMedia("(max-width: 1023px)").matches);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (globeReady) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setGlobeReady(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "800px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [globeReady]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(globeWrapRef.current, { xPercent: 0, y: 0 });

      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 1023px)").matches;

      if (!isMobile) {
        gsap.to(introRef.current, {
          y: "-30vh",
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top top",
            end: "25% top",
            scrub: true,
          },
        });
      }
      const leftItems = Array.from(leftRef.current?.children || []);
      const rightItems = Array.from(rightRef.current?.children || []);

      if (isMobile) {
        gsap.set([...leftItems, ...rightItems], { x: 0, opacity: 1 });
      } else {
        gsap.set(leftItems, { x: -22, opacity: 0 });
        gsap.set(rightItems, { x: 22, opacity: 0 });

        const badgesIo = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                gsap.to(leftItems, {
                  x: 0,
                  opacity: 1,
                  duration: COUNTRY_ITEM_DURATION,
                  ease: "power3.out",
                  stagger: COUNTRY_STAGGER_SEC,
                });
                gsap.to(rightItems, {
                  x: 0,
                  opacity: 1,
                  duration: COUNTRY_ITEM_DURATION,
                  ease: "power3.out",
                  stagger: COUNTRY_STAGGER_SEC,
                  delay: 0.05,
                });
                badgesIo.disconnect();
              }
            }
          },
          { threshold: 0.25 },
        );
        if (sectionRef.current) badgesIo.observe(sectionRef.current);
      }

      gsap.set(footerRef.current, { autoAlpha: 0, yPercent: 100 });
      gsap.set(ctaRef.current, { autoAlpha: 0, y: 40 });

      const revealTl = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .to(
          footerRef.current,
          { autoAlpha: 1, yPercent: 0, duration: FOOTER_REVEAL_DURATION },
          FOOTER_REVEAL_DELAY,
        )
        .to(
          ctaRef.current,
          { autoAlpha: 1, y: 0, duration: FOOTER_REVEAL_DURATION },
          FOOTER_REVEAL_DELAY,
        );

      const revealIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) revealTl.timeScale(1).play();
            else revealTl.timeScale(1.6).reverse();
          }
        },
        { threshold: 0.45 },
      );
      if (sectionRef.current) revealIo.observe(sectionRef.current);
      return () => revealIo.disconnect();
    }, wrapRef);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative max-lg:!h-[100svh]"
      style={{ height: `${SECTION_SCROLL_VH}vh` }}
    >
      <div
        ref={sectionRef}
        className="sticky top-0 w-full h-screen min-h-[640px] overflow-hidden max-lg:relative max-lg:top-auto max-lg:h-[100svh] max-lg:min-h-[100svh]"
        style={{
          background: "linear-gradient(180deg, #154D6D 0%, #000000 100%)",
        }}
      >
        <div
          ref={introRef}
          className="absolute top-[16vh] max-lg:top-[8vh] left-0 right-0 z-10 flex justify-center px-[6vw]"
        >
          <p
            className="flex items-center gap-4 text-white/80 tracking-wide m-3 max-md:gap-2 px-6 max-md:flex-wrap max-md:justify-center"
            style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)" }}
          >
            {eyebrow}
            <span
              className="block w-[60px] h-px"
              style={{ background: "rgba(89,191,200,0.3)" }}
            />
            <span aria-hidden>&#9992;</span>
            <span
              className="block w-[60px] h-px"
              style={{ background: "rgba(89,191,200,0.3)" }}
            />
          </p>
        </div>

        <div
          ref={bigTextRef}
          className="absolute top-[22vh] left-0 right-0 z-0 text-center font-black leading-[0.85] pointer-events-none select-none md:top-[14vh] max-lg:hidden"
          style={{
            fontSize: "22vw",
            letterSpacing: "-0.04em",
            background: "linear-gradient(180deg, #154D6D 0%, #000000 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {headline}
        </div>

        <div
          ref={globeWrapRef}
          className="absolute inset-x-0 top-[26vh] bottom-[-70vh] z-[1] pointer-events-none max-lg:hidden"
        >
          {!isMobile && globeReady && (
            <EuropeGlobeInner selectedIso={data?.globalMapCountries} />
          )}
        </div>

        {webGlobeOnMobile ? (
          <div className="lg:hidden absolute inset-x-0 top-[16vh] bottom-[-20vh] z-[1] pointer-events-none">
            {isMobile && globeReady && (
              <EuropeGlobeInner
                lowPerf
                selectedIso={data?.globalMapCountries}
              />
            )}
          </div>
        ) : (
          <div className="lg:hidden absolute inset-x-0 top-[18vh] bottom-[-32vh] z-[1] pointer-events-none">
            {isMobile && <StaticGlobe />}
          </div>
        )}

        <div
          ref={leftRef}
          className="absolute z-[4] left-[4vw] top-[34%] -translate-y-1/2 flex flex-col gap-4 max-lg:gap-2 max-lg:left-[3vw] max-lg:top-[52%] [@media(min-width:1024px)_and_(max-height:850px)]:top-[26%] [@media(min-width:1024px)_and_(max-height:850px)]:gap-2 [@media(max-width:1023px)_and_(max-height:740px)]:!top-[45%]"
        >
          {leftCountriesList.map((c, i) => (
            <div
              key={`l-${i}`}
              className="flex items-center gap-2.5 px-4 py-2 bg-white/5 lg:backdrop-blur-lg max-lg:bg-white/10 border border-[#59bfc8]/20 rounded-xl opacity-0 max-lg:px-2.5 max-lg:py-1.5 max-lg:gap-1.5"
            >
              <span aria-hidden className="text-xl leading-none">
                {c.flag}
              </span>
              <span className="text-white/90 font-medium text-sm tracking-wide max-lg:sr-only">
                {c.name}
              </span>
            </div>
          ))}
        </div>

        <div
          ref={rightRef}
          className="absolute z-[4] right-[4vw] top-[34%] -translate-y-1/2 flex flex-col gap-4 max-lg:gap-2 max-lg:right-[3vw] max-lg:top-[52%] [@media(min-width:1024px)_and_(max-height:850px)]:top-[26%] [@media(min-width:1024px)_and_(max-height:850px)]:gap-2 [@media(max-width:1023px)_and_(max-height:740px)]:!top-[45%]"
        >
          {rightCountriesList.map((c, i) => (
            <div
              key={`r-${i}`}
              className="flex items-center gap-2.5 px-4 py-2 bg-white/5 lg:backdrop-blur-lg max-lg:bg-white/10 border border-[#59bfc8]/20 rounded-xl opacity-0 max-lg:px-2.5 max-lg:py-1.5 max-lg:gap-1.5"
            >
              <span aria-hidden className="text-xl leading-none">
                {c.flag}
              </span>
              <span className="text-white/90 font-medium text-sm tracking-wide max-lg:sr-only">
                {c.name}
              </span>
            </div>
          ))}
        </div>

        <div
          id="kontakt"
          className="pointer-events-auto absolute bottom-[128px] left-[5vw] z-30 w-[min(360px,calc(100vw-32px))] max-lg:bottom-[165px] max-lg:left-1/2 max-lg:-translate-x-1/2 max-lg:w-[min(340px,calc(100vw-32px))] [@media(min-width:1024px)_and_(max-height:850px)]:scale-[0.95] [@media(min-width:1024px)_and_(max-height:850px)]:origin-bottom-left [@media(min-width:1024px)_and_(max-height:720px)]:!scale-[0.85]"
        >
          <div ref={ctaRef}>
            {!mobileCtaOpen && (
              <button
                type="button"
                onClick={() => setMobileCtaOpen(true)}
                className="lg:hidden group flex w-full cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/80 p-1.5 pl-2 shadow-md transition hover:border-white/30 hover:bg-black/85"
              >
                <span className="min-w-0 flex-1 rounded-full bg-white px-3.5 py-2 text-center text-sm font-semibold leading-snug tracking-tight text-gray-900">
                  {ctaToggleLabel}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-900 shadow-sm transition group-hover:opacity-90">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="-rotate-12"
                  >
                    <path
                      d="M21.5 2.5L2.5 11.5L10.5 13.5L13.5 21.5L21.5 2.5Z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.5 13.5L21.5 2.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            )}

            <div
              className={`rounded-2xl border border-white/20 bg-black/85 px-3.5 py-3 shadow-lg lg:backdrop-blur-2xl ${
                mobileCtaOpen
                  ? // display:none → block restartuje animację, więc formularz
                    "max-lg:block max-lg:origin-bottom max-lg:animate-[cta-pop_0.35s_cubic-bezier(0.22,1,0.36,1)_both]"
                  : "max-lg:hidden"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="m-0 text-sm font-semibold tracking-tight text-white">
                    {ctaTitle}
                  </h3>
                  <p className="mt-0.5 m-0 text-[11px] text-white/55">
                    {ctaSubtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileCtaOpen(false)}
                  aria-label="Zamknij formularz"
                  className="lg:hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white"
                >
                  <span className="text-base leading-none">&times;</span>
                </button>
              </div>
              <form className="flex flex-col gap-2" onSubmit={handleCtaSubmit}>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="name"
                    type="text"
                    autoComplete="name"
                    aria-label={ctaName}
                    className="rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-normal text-white placeholder:text-white/35 outline-none ring-[#59bfc8]/40 transition focus:border-[#59bfc8]/50 focus:ring-2"
                    placeholder={ctaName}
                  />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-label={ctaEmail}
                    className="rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-normal text-white placeholder:text-white/35 outline-none ring-[#59bfc8]/40 transition focus:border-[#59bfc8]/50 focus:ring-2"
                    placeholder={ctaEmail}
                  />
                </div>
                <textarea
                  name="message"
                  rows={2}
                  aria-label={ctaMessage}
                  className="resize-none rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-normal text-white placeholder:text-white/35 outline-none ring-[#59bfc8]/40 transition focus:border-[#59bfc8]/50 focus:ring-2"
                  placeholder={ctaMessage}
                />
                <button
                  type="submit"
                  disabled={ctaStatus === "sending"}
                  className="mt-0.5 self-end flex items-center justify-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-white/95 disabled:opacity-60"
                >
                  {ctaStatus === "sending" ? "Wysylanie..." : ctaSubmit}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="-rotate-12"
                  >
                    <path
                      d="M21.5 2.5L2.5 11.5L10.5 13.5L13.5 21.5L21.5 2.5Z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {ctaStatus === "ok" && (
                  <p role="status" className="m-0 text-sm font-medium text-[#59bfc8]">
                    Dziekujemy! Wiadomosc zostala wyslana.
                  </p>
                )}
                {ctaStatus === "error" && (
                  <p role="alert" className="m-0 text-sm font-medium text-red-300">
                    Cos poszlo nie tak. Sprobuj ponownie.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-stretch pointer-events-none pb-[env(safe-area-inset-bottom)]">
          <footer
            ref={footerRef}
            className="pointer-events-none"
            style={{ background: "rgba(0,0,0,0.22)" }}
          >
            <div
              className="pointer-events-auto border-t border-white/10"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.6) 100%)",
              }}
            >
              <div className="px-[5vw] pt-3 pb-3 md:pt-4 md:pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-2">
                  <div className="shrink-0">
                    <img
                      src="/retailologo_light.webp"
                      alt="retailo."
                      style={{
                        height: 22,
                        width: "auto",
                        display: "block",
                        marginBottom: 2,
                      }}
                      className="md:!h-[26px]"
                    />
                    <p className="text-white/45 text-[11px] m-0 mt-0.5 md:text-xs">
                      {footerTagline}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/75 md:text-sm md:gap-x-8">
                    <a
                      href="mailto:kontakt@retailo.pl"
                      className="no-underline hover:text-white transition-colors"
                    >
                      kontakt@retailo.pl
                    </a>
                    <span className="text-white/35 hidden sm:inline">|</span>
                    <a
                      href="tel:+48693731840"
                      className="no-underline hover:text-white transition-colors"
                    >
                      +48 693 731 840
                    </a>
                    <a
                      href="tel:+48531607626"
                      className="no-underline hover:text-white transition-colors"
                    >
                      +48 531 607 626
                    </a>
                    <span className="text-white/35 hidden md:inline">|</span>
                    <a
                      href="https://www.retailo.pl"
                      className="no-underline hover:text-white transition-colors"
                    >
                      www.retailo.pl
                    </a>
                    <span className="text-white/35 hidden md:inline">|</span>
                    <span className="text-white/60">
                      Pl. Jana Kilińskiego 2, 35-005 Rzeszów, Polska · NIP: 5170407536
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/5 pt-2.5 text-[11px] text-white/60">
                  <p className="m-0">{footerCopyright}</p>
                  <div className="flex gap-4">
                    <a
                      href="/polityka-prywatnosci"
                      className="no-underline hover:text-white/55 transition-colors"
                    >
                      {footerPrivacyLabel}
                    </a>
                    <CookieSettingsLink
                      label={t(settings?.cookieSettingsLinkLabel ?? null)}
                      className="border-0 bg-transparent p-0 text-[11px] text-white/60 hover:text-white/90 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
