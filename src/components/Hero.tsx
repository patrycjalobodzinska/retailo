"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { LocalizedField } from "@/lib/sanity/i18n";

type HeroData = {
  heroSubtitle?: LocalizedField;
  heroDescription?: LocalizedField;
  heroScrollLabel?: LocalizedField;
} | null;

export default function Hero({ data }: { data?: HeroData } = {}) {
  const { t } = useLang();
  const subtitle = t(data?.heroSubtitle ?? null) || "PickUpWall";
  const description =
    "Automatyczne, modulowe systemy odbioru przesylek typu pick-up in store dla sieci retailu. Projektujemy, produkujemy i wdrazamy rozwiazania dopasowane do specyfiki marki — od jednostki glownej z dotykowym ekranem po skalowalna konfiguracje skrytek i bezdotykowy odbior ponizej 15 sekund.";

  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const statRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        imageRef.current,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.1, ease: "power2.out", delay: 0.1 },
      )
        .fromTo(
          titleRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 0.55, duration: 0.9 },
          "-=0.8",
        )
        .fromTo(
          contentRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6",
        )
        .fromTo(
          [cardRef.current, statRef.current],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
          "-=0.5",
        );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen min-h-[720px] overflow-hidden flex items-stretch max-lg:h-auto max-lg:min-h-[100dvh] max-lg:flex-col"
      style={{ background: "#fafaf8" }}>
      {/* LEFT: text content */}
      <div
        ref={contentRef}
        className="relative flex flex-col justify-start pl-[5vw] pr-[2vw] pt-[18vh] w-[32%] max-2xl:w-[34%] max-xl:w-[38%] max-lg:w-full max-lg:pl-[6vw] max-lg:pr-[6vw] max-lg:pt-[12dvh]"
        style={{ opacity: 0, transform: "translateY(20px)" }}>
        <img
          src="/retailologo.webp"
          alt="retailo"
          className="block self-start h-[34px] w-auto mb-7 max-lg:h-[26px] max-lg:mb-5"
          style={{ width: "auto" }}
        />

        <h1
          ref={titleRef}
          className="m-0 mb-7 font-black tracking-tighter text-[#0f0f0f] max-lg:mb-5"
          style={{
            fontSize: "clamp(3.4rem, 6.6vw, 7.6rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.055em",
            opacity: 0,
            transform: "translateY(30px)",
          }}>
          {subtitle}.
        </h1>

        <div
          className="w-10 h-px mb-6 max-lg:hidden"
          style={{ background: "#0f0f0f" }}
        />
        <p
          className="m-0 mb-8 text-[#3a3a3a] leading-relaxed font-light max-lg:hidden"
          style={{
            fontSize: "clamp(1rem, 1.1vw, 1.1rem)",
            maxWidth: "440px",
          }}>
          {description}
        </p>
      </div>

      {/* CENTER: image */}
      <div className="relative flex-1 flex items-center justify-center px-[2vw] pl-[6vw] pt-[10vh] pb-[8vh] max-lg:pl-[2vw] max-lg:pt-[2dvh] max-lg:pb-[2dvh] max-lg:flex-col">
        <div
          aria-hidden="true"
          className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 pointer-events-none max-lg:hidden"
          style={{
            width: "60%",
            height: "60px",
            background:
              "radial-gradient(ellipse at center, rgba(15,15,15,0.18) 0%, rgba(15,15,15,0) 70%)",
            filter: "blur(14px)",
          }}
        />
        <img
          ref={imageRef}
          src="/hero-pickupwall.png"
          alt="PickUpWall"
          className="relative block h-[89vh] w-auto object-contain max-lg:h-[42dvh]"
          style={{
            opacity: 0,
            transform: "translateX(-40px)",
            filter:
              "drop-shadow(0 18px 30px rgba(15,15,15,0.18)) drop-shadow(0 6px 12px rgba(15,15,15,0.10))",
          }}
        />
        {/* Mobile-only description, sits directly under the image */}
        <p
          className="hidden max-lg:block m-0 mt-6 px-[6vw] text-[#3a3a3a] leading-relaxed font-light"
          style={{ fontSize: "0.95rem" }}>
          {description}
        </p>
      </div>

      {/* Wide stat strip pinned to bottom-left of the section */}
      <a
        ref={statRef}
        href="#rozwiazanie"
        className="absolute bottom-[12vh] left-[5vw] z-[4] grid grid-cols-3 gap-0 rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5 w-[36%] max-2xl:w-[40%] max-xl:w-[44%] max-lg:hidden"
        style={{
          background: "white",
          border: "1px solid rgba(15,15,15,0.06)",
          boxShadow:
            "0 1px 2px rgba(15,15,15,0.04), 0 16px 36px rgba(15,15,15,0.06)",
          opacity: 0,
          transform: "translateY(20px)",
        }}>
        {[
          ["<15 s", "Czas odbioru"],
          ["Modulowy", "System skrytek"],
          ["API", "Integracja"],
        ].map(([value, label], i) => (
          <div
            key={label}
            className="flex flex-col gap-1 px-5 py-4"
            style={{
              borderLeft: i === 0 ? "none" : "1px solid rgba(15,15,15,0.06)",
            }}>
            <span
              className="font-bold text-[#0f0f0f] tracking-tight"
              style={{
                fontSize: "clamp(1.2rem, 1.5vw, 1.55rem)",
                lineHeight: 1,
              }}>
              {value}
            </span>
            <span
              className="uppercase tracking-[0.2em] font-semibold text-[#7a7a7a]"
              style={{ fontSize: "0.6rem" }}>
              {label}
            </span>
          </div>
        ))}
      </a>

      {/* RIGHT: install reference card pinned to the bottom */}
      <div className="relative flex flex-col justify-end pb-[6vh] pl-[2vw] pr-[5vw] w-[21%] max-2xl:w-[23%] max-xl:w-[26%] max-lg:w-full max-lg:pl-[6vw] max-lg:pr-[6vw] max-lg:pb-[2dvh] max-lg:max-w-[520px] max-lg:mx-auto">
        <div className="flex flex-col gap-3 max-lg:flex-row max-lg:items-stretch">
          <a
            ref={cardRef}
            href="#realizacje"
            className="flex flex-col rounded-3xl overflow-hidden transition-transform hover:-translate-y-0.5 max-lg:rounded-2xl max-lg:flex-[2.4] max-lg:min-w-0"
            style={{
              background: "white",
              border: "1px solid rgba(15,15,15,0.06)",
              boxShadow:
                "0 1px 2px rgba(15,15,15,0.04), 0 16px 36px rgba(15,15,15,0.08)",
              opacity: 0,
              transform: "translateY(20px)",
            }}>
            <div
              className="w-full flex items-center justify-center max-lg:aspect-[16/9]"
              style={{ aspectRatio: "21 / 7", background: "#f0efeb" }}>
              <img
                src="/sephora-pickupwall.jpeg"
                alt="Wdrozenie PickUpWall"
                className="block w-full h-full object-contain"
              />
            </div>
            <div className="flex items-end justify-between gap-2.5 p-3.5 max-lg:p-3 max-lg:gap-2">
              <div className="flex-1 min-w-0">
                <span
                  className="block uppercase tracking-[0.24em] font-semibold text-[#7a7a7a] mb-1.5 max-lg:mb-1"
                  style={{ fontSize: "0.56rem" }}>
                  Zaufali nam
                </span>
                <p
                  className="m-0 mb-0.5 font-bold tracking-tight text-[#0f0f0f] max-lg:text-[0.92rem] max-lg:leading-tight"
                  style={{
                    fontSize: "clamp(1rem, 1.15vw, 1.2rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                  }}>
                  Wdrazamy dla najwiekszych marek.
                </p>
                <p
                  className="m-0 text-[#5a5a5a] font-light max-lg:hidden"
                  style={{ fontSize: "0.72rem", lineHeight: 1.4 }}>
                  Sieci kosmetyczne, fashion, elektronika.
                </p>
              </div>
              <span
                className="inline-flex items-center justify-center rounded-full flex-shrink-0 max-lg:w-7 max-lg:h-7"
                style={{
                  width: 38,
                  height: 38,
                  background: "#0f0f0f",
                  color: "white",
                }}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
          </a>

          {/* Mobile-only stat strip — informational, not clickable */}
          <div
            aria-label="Specyfikacja PickUpWall"
            className="hidden max-lg:flex flex-col flex-1 max-w-[100px] min-w-0 rounded-2xl overflow-hidden"
            style={{
              background: "white",
              border: "1px solid rgba(15,15,15,0.06)",
              boxShadow:
                "0 1px 2px rgba(15,15,15,0.04), 0 16px 36px rgba(15,15,15,0.06)",
            }}>
            {[
              ["<15 s", "Czas odbioru"],
              ["Modulowy", "System skrytek"],
              ["API", "Integracja"],
            ].map(([value, label], i) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 px-3 py-3 flex-1 justify-center"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid rgba(15,15,15,0.04)",
                }}>
                <span
                  className="font-bold text-[#0f0f0f] tracking-tight"
                  style={{ fontSize: "0.95rem", lineHeight: 1 }}>
                  {value}
                </span>
                <span
                  className="uppercase tracking-[0.18em] font-semibold text-[#7a7a7a]"
                  style={{ fontSize: "0.55rem" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
