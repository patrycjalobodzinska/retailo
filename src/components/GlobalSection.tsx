"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GlobeComponent = dynamic(() => import("./GlobeInner"), {
  ssr: false,
});

const LEFT_COUNTRIES = [
  { name: "Polska", flag: "🇵🇱" },
  { name: "Niemcy", flag: "🇩🇪" },
  { name: "Francja", flag: "🇫🇷" },
  { name: "Hiszpania", flag: "🇪🇸" },
  { name: "Wlochy", flag: "🇮🇹" },
  { name: "Wielka Brytania", flag: "🇬🇧" },
];

const RIGHT_COUNTRIES = [
  { name: "Czechy", flag: "🇨🇿" },
  { name: "Slowacja", flag: "🇸🇰" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Rumunia", flag: "🇷🇴" },
  { name: "Szwecja", flag: "🇸🇪" },
  { name: "Holandia", flag: "🇳🇱" },
];

/** Wysokość scrolla sekcji — mniejsza = szybciej „mija” sekcję. */
const SECTION_SCROLL_VH = 130;
/** Stopka + CTA pojawiają się czasowo (po wejściu sekcji w viewport),
    a nie wraz z postępem scrolla. */
const FOOTER_REVEAL_DELAY = 0.6; // s
const FOOTER_REVEAL_DURATION = 0.9; // s
/**
 * Po jakiej części przewinięcia sekcji (0–1) startuje animacja krajów — sam scroll tylko ją odpala;
 * kolejka jest płynna w czasie (GSAP), nie „przypięta” do dalszego ruchu scrolla.
 * Musi być < (wrap.h − section.h) / wrap.h = (175 − 100) / 175 ≈ 0.43, inaczej
 * trigger pali się dopiero PO odklejeniu sticky sekcji — countries lecą do
 * opacity:1 nad viewportem i ich nie widać.
 */
const COUNTRY_SCROLL_PROGRESS = 0.18;
/** Odstęp między kolejnymi parami (s) — większe = wolniejsza kolejka. */
const COUNTRY_STAGGER_SEC = 0.12;
/** Długość wejścia jednego wiersza (s) — większe = bardziej płynnie. */
const COUNTRY_ITEM_DURATION = 0.78;
/** Wyjście — proporcjonalnie do wejścia (krótsze = szybsze znikanie). */
const COUNTRY_EXIT_DURATION = COUNTRY_ITEM_DURATION * 0.55;
const COUNTRY_EXIT_STAGGER = COUNTRY_STAGGER_SEC * 0.9;

export default function GlobalSection() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const bigTextRef = useRef<HTMLDivElement>(null);
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [globeSize, setGlobeSize] = useState(1500);
  const [mobileCtaOpen, setMobileCtaOpen] = useState(false);

  useEffect(() => {
    const updateSize = () =>
      setGlobeSize(
        window.innerWidth < 768 ? 760 : window.innerWidth < 900 ? 600 : 1100,
      );
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Globus i napis GLOBAL — bez scroll-scruba. Wcześniej przesuwanie
      // y na scrollu powodowało zacinanie/lagowanie (zwłaszcza na mobile).
      // Teraz globus stoi w jednym miejscu, napis GLOBAL też nie driftuje.
      gsap.set(globeWrapRef.current, { xPercent: -50, y: 0 });

      // Intro fades out early
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

      // Kraje: przy progu scrolla w sekcji odpala się timeline — potem płynna kolejka w czasie (nie scrub do scrolla).
      // Na mobile pomijamy animację — wrap i sticky mają tę samą wysokość,
      // więc ScrollTrigger nie odpala się w spodziewanym momencie i karty
      // zostawały na opacity:0. Mobile od razu pokazuje je statycznie.
      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 1023px)").matches;
      const leftItems = Array.from(leftRef.current?.children || []);
      const rightItems = Array.from(rightRef.current?.children || []);
      if (isMobile) {
        gsap.set([...leftItems, ...rightItems], { x: 0, opacity: 1 });
      } else {
        gsap.set(leftItems, { x: -22, opacity: 0 });
        gsap.set(rightItems, { x: 22, opacity: 0 });
      }

      const maxLen = Math.max(leftItems.length, rightItems.length);

      // Build a single timeline with the country reveal at progress 0.
      // GSAP's play()/reverse() handle scroll up/down naturally — far more
      // robust than the previous countryShown/exitRunning state machine,
      // which could get stuck if the user oscillated across the threshold
      // mid-tween (the kill-and-restart logic left items half-faded).
      const countryTl = gsap.timeline({ paused: true });
      const easeCountry = "power3.out";
      for (let i = 0; i < maxLen; i++) {
        const t = i * COUNTRY_STAGGER_SEC;
        if (leftItems[i]) {
          countryTl.to(
            leftItems[i],
            {
              x: 0,
              opacity: 1,
              duration: COUNTRY_ITEM_DURATION,
              ease: easeCountry,
            },
            t,
          );
        }
        if (rightItems[i]) {
          countryTl.to(
            rightItems[i],
            {
              x: 0,
              opacity: 1,
              duration: COUNTRY_ITEM_DURATION,
              ease: easeCountry,
            },
            t + 0.05,
          );
        }
      }

      ScrollTrigger.create({
        trigger: wrapRef.current,
        start: `${Math.round(COUNTRY_SCROLL_PROGRESS * 100)}% top`,
        end: "bottom bottom",
        invalidateOnRefresh: true,
        // Once the badges have appeared they stay — no reverse on leave.
        // Earlier the timeline reversed when scrolling past the trigger
        // end (or back above start), and the flags blinked out as the
        // user kept scrolling.
        onEnter: () => countryTl.timeScale(1).play(),
        onEnterBack: () => countryTl.timeScale(1).play(),
      });

      // Stopka + CTA + uniesienie globusa: pojawiają się czasowo po wejściu
      // sekcji w viewport (delay + płynna animacja własna), niezależnie od
      // tempa scrolla użytkownika. Animacja jest wielorazowa — gra się przy
      // każdym wejściu sekcji w viewport, a cofa przy wyjściu.
      gsap.set(footerRef.current, { autoAlpha: 0, yPercent: 100 });
      gsap.set(ctaRef.current, { autoAlpha: 0, y: 40 });

      // Globus nie jest już animowany w tym timeline'em — pełen zakres
      // ruchu obsługuje pojedynczy scrub powyżej, dzięki czemu nie ma
      // konkurujących tweenów na tej samej własności (efekt "skoku").
      const revealTl = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .to(
          footerRef.current,
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: FOOTER_REVEAL_DURATION,
          },
          FOOTER_REVEAL_DELAY,
        )
        .to(
          ctaRef.current,
          {
            autoAlpha: 1,
            y: 0,
            duration: FOOTER_REVEAL_DURATION,
          },
          FOOTER_REVEAL_DELAY,
        );

      const revealIo = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              revealTl.timeScale(1).play();
            } else {
              revealTl.timeScale(1.6).reverse();
            }
          }
        },
        { threshold: 0.45 },
      );
      if (sectionRef.current) revealIo.observe(sectionRef.current);
      return () => revealIo.disconnect();
    }, wrapRef);

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative max-lg:!h-[100dvh]"
      style={{ height: `${SECTION_SCROLL_VH}vh` }}>
      {/* Sticky section */}
      <div
        ref={sectionRef}
        className="sticky top-0 w-full h-screen min-h-[640px] overflow-hidden max-lg:h-[100dvh] max-lg:min-h-[100dvh]"
        style={{
          background: "linear-gradient(180deg, #154D6D 0%, #000000 100%)",
        }}>
        {/* Intro text */}
        <div
          ref={introRef}
          className="absolute top-[16vh] max-lg:top-[12vh] left-0 right-0 z-10 flex justify-center px-[6vw]">
          <p
            className="flex items-center gap-4 text-white/80 tracking-wide m-3 max-md:gap-2 px-6 max-md:flex-wrap max-md:justify-center"
            style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.5rem)" }}>
            Wdrozenia w calej Europie
            <span
              className="block w-[60px] h-px"
              style={{ background: "rgba(89,191,200,0.3)" }}
            />
            &#9992;
            <span
              className="block w-[60px] h-px"
              style={{ background: "rgba(89,191,200,0.3)" }}
            />
          </p>
        </div>

        {/* GLOBAL text */}
        <div
          ref={bigTextRef}
          className="absolute top-[22vh] left-0 right-0 z-0 text-center font-black leading-[0.85] pointer-events-none select-none md:top-[14vh]"
          style={{
            fontSize: "22vw",
            letterSpacing: "-0.04em",
            background: "linear-gradient(180deg, #154D6D 0%, #000000 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          GLOBAL
        </div>

        {/* Globe */}
        <div
          ref={globeWrapRef}
          className="absolute left-[50%] top-[28%] z-[3] md:top-[24%]">
          <GlobeComponent width={globeSize} height={globeSize} />
        </div>

        {/* Left countries */}
        <div
          ref={leftRef}
          className="absolute z-[4] left-[4vw] top-[34%] -translate-y-1/2 flex flex-col gap-4 max-lg:gap-2 max-lg:left-[3vw] max-lg:top-[52%]">
          {LEFT_COUNTRIES.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2.5 px-4 py-2 bg-white/5 backdrop-blur-lg border border-[#59bfc8]/20 rounded-xl opacity-0 max-lg:px-2.5 max-lg:py-1.5 max-lg:gap-1.5">
              <span className="text-xl leading-none">{c.flag}</span>
              <span className="text-white/90 font-medium text-sm tracking-wide max-lg:hidden">
                {c.name}
              </span>
            </div>
          ))}
        </div>

        {/* Right countries */}
        <div
          ref={rightRef}
          className="absolute z-[4] right-[4vw] top-[34%] -translate-y-1/2 flex flex-col gap-4 max-lg:gap-2 max-lg:right-[3vw] max-lg:top-[52%]">
          {RIGHT_COUNTRIES.map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2.5 px-4 py-2 bg-white/5 backdrop-blur-lg border border-[#59bfc8]/20 rounded-xl opacity-0 max-lg:px-2.5 max-lg:py-1.5 max-lg:gap-1.5">
              <span className="text-xl leading-none">{c.flag}</span>
              <span className="text-white/90 font-medium text-sm tracking-wide max-lg:hidden">
                {c.name}
              </span>
            </div>
          ))}
        </div>

        {/* CTA: desktop — formularz na stałe; mobile — toggle button → form */}
        <div
          ref={ctaRef}
          id="kontakt"
          className="pointer-events-auto absolute bottom-[180px] left-[5vw] z-30 w-[min(360px,calc(100vw-32px))] max-lg:bottom-[170px] max-lg:left-1/2 max-lg:-translate-x-1/2 max-lg:w-[min(240px,calc(100vw-48px))]">
          {/* Mobile-only toggle button — pokazywany kiedy formularz zwinięty */}
          {!mobileCtaOpen && (
            <button
              type="button"
              onClick={() => setMobileCtaOpen(true)}
              className="lg:hidden group flex w-full items-center gap-2 rounded-full border border-white/20 bg-black/45 p-1.5 pl-2 shadow-md transition hover:border-white/30 hover:bg-black/55"
              style={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}>
              <span className="min-w-0 flex-1 rounded-full bg-white px-3.5 py-2 text-center text-sm font-semibold leading-snug tracking-tight text-gray-900">
                Porozmawiajmy
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-900 shadow-sm transition group-hover:opacity-90">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="-rotate-12">
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

          {/* Formularz — zawsze widoczny na desktop, na mobile tylko gdy otwarty */}
          <div
            className={`rounded-2xl border border-white/20 bg-black/85 px-3.5 py-3 shadow-lg backdrop-blur-2xl ${
              mobileCtaOpen ? "max-lg:block" : "max-lg:hidden"
            }`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <h3 className="m-0 text-sm font-semibold tracking-tight text-white">
                  Napisz do nas
                </h3>
                <p className="mt-0.5 m-0 text-[11px] text-white/55">
                  Odezwiemy się w ciągu 24h.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileCtaOpen(false)}
                aria-label="Zamknij formularz"
                className="lg:hidden flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white">
                <span className="text-base leading-none">&times;</span>
              </button>
            </div>
            <form
              className="flex flex-col gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
              }}>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-normal text-white placeholder:text-white/35 outline-none ring-[#59bfc8]/40 transition focus:border-[#59bfc8]/50 focus:ring-2"
                  placeholder="Imię i nazwisko"
                />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-normal text-white placeholder:text-white/35 outline-none ring-[#59bfc8]/40 transition focus:border-[#59bfc8]/50 focus:ring-2"
                  placeholder="E-mail"
                />
              </div>
              <textarea
                name="message"
                rows={2}
                className="resize-none rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-normal text-white placeholder:text-white/35 outline-none ring-[#59bfc8]/40 transition focus:border-[#59bfc8]/50 focus:ring-2"
                placeholder="Wiadomość..."
              />
              <button
                type="submit"
                className="mt-0.5 flex items-center justify-center gap-1.5 rounded-full bg-white py-1.5 text-xs font-semibold text-gray-900 transition hover:bg-white/95">
                Wyślij
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="-rotate-12">
                  <path
                    d="M21.5 2.5L2.5 11.5L10.5 13.5L13.5 21.5L21.5 2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Dolny blok: stopka */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-stretch pointer-events-none pb-[env(safe-area-inset-bottom)]">
          <footer ref={footerRef} className="pointer-events-none">
            <div
              className="pointer-events-auto border-t border-white/10"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.72) 100%)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}>
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
                      Automaty paczkowe
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/75 md:text-sm md:gap-x-8">
                    <a
                      href="mailto:info@retailo.pl"
                      className="no-underline hover:text-white transition-colors">
                      info@retailo.pl
                    </a>
                    <span className="text-white/35 hidden sm:inline">|</span>
                    <a
                      href="tel:+48123456789"
                      className="no-underline hover:text-white transition-colors">
                      +48 123 456 789
                    </a>
                    <span className="text-white/35 hidden md:inline">|</span>
                    <span className="text-white/60">
                      ul. Przykladowa 10, 00-001 Warszawa
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-white/5 pt-2.5 text-[11px] text-white/30">
                  <p className="m-0">&copy; 2026 retailo</p>
                  <div className="flex gap-4">
                    <a
                      href="#"
                      className="no-underline hover:text-white/55 transition-colors">
                      Polityka prywatnosci
                    </a>
                    <a
                      href="#"
                      className="no-underline hover:text-white/55 transition-colors">
                      Regulamin
                    </a>
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
