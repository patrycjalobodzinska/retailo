"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { HomePage } from "@/lib/sanity/fetch";

gsap.registerPlugin(ScrollTrigger);

const STEPS_FALLBACK = [
  [
    "Integracja",
    "Gwarantujemy elastycznosc w integracji - w sposobie komunikacji, jak i zakresie przesylanych danych.",
  ],
  [
    "RODO",
    "Zagwarantujemy zgodnosc z zasadami przetwarzania danych osobowych.",
  ],
  [
    "Instalacja",
    "Instalacja i konfiguracja systemu z klientem, upewnienie sie czy zakres jest adekwatny do oczekiwan.",
  ],
  [
    "Wsparcie",
    "Dedykowane pakiety serwisowe i rozwoj systemu zapewniajace trwalosc i stabilnosc rozwiazania.",
  ],
] as const;

const HARDWARE_FALLBACK = [
  ["Liczba skrytek", "od 3 do 320"],
  ["Ekran", 'od 10" do 21.5"'],
  ["Kolory urzadzen", "dowolne z palety RAL"],
  ["Rozwiazania", "indoor i outdoor"],
] as const;

export default function ProductShowcase({
  data,
}: { data?: HomePage } = {}) {
  const { t, lang } = useLang();
  const eyebrow = t(data?.productEyebrow ?? null) || "Nasze rozwiazanie";
  const headline = t(data?.productHeadline ?? null) || "PickUpWall";
  const stepsLabel =
    t(data?.productStepsLabel ?? null) || "Wdrozenie krok po kroku";
  const brandLabel = t(data?.productBrandLabel ?? null) || "retailo.";
  const specsHeadline =
    t(data?.productSpecsHeadline ?? null) || "Specyfikacja techniczna";
  const hardwareLabel = t(data?.productHardwareLabel ?? null) || "Hardware";
  const personalizationKicker =
    t(data?.productPersonalizationKicker ?? null) ||
    (lang === "en" ? "Personalisation" : "Personalizacja");
  const personalizationHeadline =
    t(data?.productPersonalizationHeadline ?? null) ||
    (lang === "en"
      ? "Every PickUpWall is built **around you.**"
      : "Każdy PickUpWall budujemy **pod Ciebie.**");
  const personalizationText =
    t(data?.productPersonalizationText ?? null) ||
    (lang === "en"
      ? "Format, locker count, screen, enclosure and graphics - all tailored to your brand and your space."
      : "Format, liczba skrytek, ekran, obudowa i grafika - wszystko pod Twoją markę i przestrzeń.");

  const steps: Array<[string, string]> =
    data?.productFeatures && data.productFeatures.length > 0
      ? data.productFeatures.map((f) => [
          t(f.title) || "",
          t(f.description) || "",
        ])
      : STEPS_FALLBACK.map((s) => [s[0], s[1]] as [string, string]);
  const hardwareRows: Array<[string, string]> =
    data?.productHardwareRows && data.productHardwareRows.length > 0
      ? data.productHardwareRows.map((r) => [t(r.label) || "", t(r.value) || ""])
      : HARDWARE_FALLBACK.map((r) => [r[0], r[1]] as [string, string]);
  const sectionRef = useRef<HTMLElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const sketchRef = useRef<HTMLImageElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLOListElement>(null);
  const [mobilePhase2InView, setMobilePhase2InView] =
    useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const el = phase2Ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setMobilePhase2InView(true);
          else setMobilePhase2InView(false);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 1023px)").matches;
      if (isMobile) return; // mobile uses inline images, no sticky/GSAP

      gsap.set(sketchRef.current, { opacity: 0 });

      const phase2Tl = gsap.timeline({ paused: true });
      phase2Tl
        .to(
          sketchRef.current,
          { opacity: 0.95, duration: 1.2, ease: "power1.inOut" },
          0,
        )
        .to(
          photoRef.current,
          { opacity: 0, duration: 1.2, ease: "power1.inOut" },
          0,
        )
        .fromTo(
          imageWrapRef.current,
          { y: 0 },
          { y: 160, duration: 1.2, ease: "power1.inOut" },
          0,
        );

      ScrollTrigger.create({
        trigger: phase2Ref.current,
        start: "top 40%",
        end: "bottom center",
        onEnter: () => phase2Tl.play(),
        onLeaveBack: () => phase2Tl.reverse(),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="flex justify-center" style={{ background: "#c0dbe2" }}>
        <div className="w-[40%] h-px bg-[#a0b8c0]" />
      </div>
      <section
        ref={sectionRef}
        className="relative w-full"
        style={{
          background: "linear-gradient(180deg, #c0dbe2 0%, #e9e2d8 100%)",
        }}>

        <div className="pointer-events-none absolute inset-0 z-[5] max-lg:hidden">
          <div className="sticky top-0 h-screen w-full">
            <div ref={imageWrapRef} className="absolute right-[5vw] top-1/2 -translate-y-1/2 w-[480px] aspect-square 2xl:right-[8vw] max-2xl:!w-[420px] max-xl:!w-[360px] max-xl:!right-[3vw]">
              <img
                ref={sketchRef}
                src={data?.productSketch || "/pickupwall-sketch.png"}
                alt="PickUpWall szkic"
                loading="eager"
                decoding="async"
                fetchPriority="low"
                className="absolute inset-0 w-full h-full object-contain opacity-0"
              />
              <img
                ref={photoRef}
                src={data?.productPhoto || "/pickupwall-photo.png"}
                alt="PickUpWall"
                loading="eager"
                decoding="async"
                fetchPriority="low"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ willChange: "opacity" }}
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            ref={phase1Ref}
            className="relative h-[65vh] min-h-[480px] max-lg:h-auto max-lg:min-h-0 max-lg:pt-[5svh] max-lg:pb-[1svh]">
            <div className="hidden max-lg:flex justify-center px-[6vw] mb-6">
              <img
                src={data?.productPhoto || "/pickupwall-photo.png"}
                alt="PickUpWall"
                className="block w-[68vw] max-w-[320px] h-auto object-contain"
                style={{
                  filter:
                    "drop-shadow(0 14px 24px rgba(15,15,15,0.16)) drop-shadow(0 4px 10px rgba(15,15,15,0.08))",
                }}
              />
            </div>
            <div className="absolute inset-0 z-[3] pointer-events-none max-lg:relative max-lg:inset-auto">
              <div className="absolute top-[8vh] left-[5vw] max-w-[380px] 2xl:left-[8vw] max-lg:relative max-lg:top-auto max-lg:left-auto max-lg:px-[6vw] max-lg:mb-5 max-lg:max-w-none pointer-events-none">
                <p
                  className="text-[#2a2a2a]/80 font-light m-0 mb-2 leading-tight max-lg:text-[1.05rem] max-lg:mb-2"
                  style={{ fontSize: "clamp(1.2rem, 2vw, 1.8rem)" }}>
                  {eyebrow}
                  <br />
                  <span className="font-semibold" style={{ color: "#0086b0" }}>
                    {headline}
                  </span>
                </p>
              </div>
              <ol
                ref={featuresRef}
                className="absolute top-[24vh] left-[5vw] m-0 p-0 list-none flex flex-col gap-5 max-w-[400px] 2xl:left-[8vw] pointer-events-auto max-lg:relative max-lg:top-auto max-lg:bottom-auto max-lg:left-auto max-lg:px-[6vw] max-lg:max-w-none max-lg:gap-3">
                <li className="m-0 p-0">
                  <p
                    className="m-0 mb-4 uppercase tracking-[0.22em] font-bold max-lg:mb-3"
                    style={{
                      fontSize: "clamp(0.78rem, 0.9vw, 0.92rem)",
                      color: "#0086b0",
                    }}>
                    {stepsLabel}
                  </p>
                </li>
                {steps.map(([title, desc], i) => (
                  <li
                    key={title}
                    className="flex items-start gap-4 text-left max-lg:gap-3">
                    <span
                      className="flex-shrink-0 flex items-center justify-center font-bold tabular-nums"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        border: "1.5px solid #0086b0",
                        color: "#0086b0",
                        fontSize: "0.78rem",
                        marginTop: 2,
                      }}>
                      {i + 1}
                    </span>
                    <span className="flex flex-col gap-1 max-lg:gap-0.5">
                      <span
                        className="font-semibold uppercase tracking-widest max-lg:text-[0.74rem]"
                        style={{
                          color: "#0086b0",
                          fontSize: "clamp(0.9rem, 1.05vw, 1.05rem)",
                        }}>
                        {title}
                      </span>
                      <span
                        className="text-[#2a2a2a]/85 leading-snug max-lg:text-[0.82rem] max-lg:line-clamp-2"
                        style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)" }}>
                        {desc}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div
            ref={phase2Ref}
            className="relative h-[88vh] min-h-[600px] pb-[8vh] max-lg:h-auto max-lg:min-h-0 max-lg:pt-[7svh] max-lg:pb-[8svh]">
            <div className="hidden max-lg:flex justify-center px-[6vw] mb-6">
              <div className="relative w-[68vw] max-w-[320px] aspect-square">
                <img
                  src={data?.productSketch || "/pickupwall-sketch.png"}
                  alt="PickUpWall szkic"
                  className="absolute inset-0 w-full h-full object-contain transition-opacity ease-out"
                  style={{
                    opacity: mobilePhase2InView ? 0.95 : 0,
                    transitionDuration: "600ms",
                    transitionDelay: mobilePhase2InView ? "300ms" : "0ms",
                  }}
                />
                <img
                  src={data?.productPhoto || "/pickupwall-photo.png"}
                  alt="PickUpWall"
                  className="absolute inset-0 w-full h-full object-contain transition-opacity ease-out"
                  style={{
                    opacity: mobilePhase2InView ? 0 : 1,
                    transitionDuration: "900ms",
                    transitionDelay: mobilePhase2InView ? "200ms" : "0ms",
                  }}
                />
              </div>
            </div>
            <div className="absolute inset-0 flex items-start justify-start pl-[6vw] pr-[4vw] pt-[22vh] pb-[4vh] pointer-events-none z-[1] max-lg:relative max-lg:inset-auto max-lg:flex-col max-lg:justify-start max-lg:gap-4 max-lg:p-[3svh_6vw_0] max-lg:min-h-0">
              <div className="flex flex-col w-full max-w-[560px] pointer-events-auto max-2xl:max-w-[520px] max-xl:max-w-[470px] max-lg:max-w-full">
                <h2
                  className="uppercase tracking-widest m-0 mb-1"
                  style={{
                    fontSize: "clamp(0.85rem, 1.1vw, 1.1rem)",
                    color: "#0086b0",
                  }}>
                  {brandLabel}
                </h2>
                <p
                  className="font-bold m-0 mb-7 leading-none tracking-tighter text-[#2a2a2a] max-lg:mb-5"
                  style={{ fontSize: "clamp(1.8rem, 3.2vw, 3.2rem)" }}>
                  {specsHeadline}
                </p>

                <div className="mb-8 max-lg:mb-6">
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-[#0086b0]/25 bg-[#0086b0]/10 px-4 py-1.5 font-semibold uppercase tracking-[0.18em] text-[#0086b0]"
                    style={{ fontSize: "0.68rem" }}>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden>
                      <path d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2z" />
                    </svg>
                    {personalizationKicker}
                  </span>
                  <p
                    className="m-0 mt-3 font-bold tracking-tight text-[#0a2a2e]"
                    style={{
                      fontSize: "clamp(1.25rem, 1.9vw, 1.7rem)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.01em",
                      maxWidth: "20ch",
                    }}>
                    {personalizationHeadline
                      .split(/\*\*(.+?)\*\*/g)
                      .map((part, i) =>
                        i % 2 === 1 ? (
                          <span key={i} style={{ color: "#0086b0" }}>
                            {part}
                          </span>
                        ) : (
                          part
                        ),
                      )}
                  </p>
                  <p
                    className="m-0 mt-2.5 text-[#3a5a60] leading-relaxed"
                    style={{ fontSize: "0.9rem", maxWidth: "34ch" }}>
                    {personalizationText}
                  </p>
                </div>

                <div
                  className="pb-3 border-b"
                  style={{ borderColor: "rgba(15,42,46,0.18)" }}>
                  <span
                    className="font-bold tracking-tight"
                    style={{
                      color: "#0086b0",
                      fontSize: "clamp(1rem, 1.2vw, 1.2rem)",
                    }}>
                    {hardwareLabel}
                  </span>
                </div>
                {hardwareRows.map(([label, value], i, arr) => (
                  <div
                    key={label}
                    className={`grid grid-cols-[1fr_1.3fr] items-baseline gap-x-6 py-3 ${
                      i < arr.length - 1 ? "border-b" : ""
                    }`}
                    style={{ borderColor: "rgba(15,42,46,0.08)" }}>
                    <span
                      className="font-semibold text-[#0a2a2e]"
                      style={{ fontSize: "clamp(0.92rem, 1.05vw, 1.05rem)" }}>
                      {label}
                    </span>
                    <span
                      className="text-right text-[#2a2a2a]/80"
                      style={{ fontSize: "clamp(0.92rem, 1.05vw, 1.05rem)" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
