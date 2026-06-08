"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { LocalizedField } from "@/lib/sanity/i18n";

type HeroData = {
  heroImage?: string;
  heroInstallImage?: string;
  heroSubtitle?: LocalizedField;
  heroDescription?: LocalizedField;
  heroScrollLabel?: LocalizedField;
  heroBadges?: Array<{ value?: LocalizedField; label?: LocalizedField }>;
  heroInstallEyebrow?: LocalizedField;
  heroInstallTitle?: LocalizedField;
  heroInstallSubtitle?: LocalizedField;
} | null;

export default function HeroConcept({ data }: { data?: HeroData } = {}) {
  const { t, lang } = useLang();
  const subtitle = t(data?.heroSubtitle ?? null) || "PickUpWall";
  const description =
    t(data?.heroDescription ?? null) ||
    "Automatyczne, modulowe systemy odbioru przesylek typu pick-up in store dla sieci retailu. Projektujemy, produkujemy i wdrazamy rozwiazania dopasowane do specyfiki marki - od jednostki glownej z dotykowym ekranem po skalowalna konfiguracje skrytek i bezdotykowy odbior ponizej 10 sekund.";
  const installEyebrow =
    t(data?.heroInstallEyebrow ?? null) || "Zaufali nam";
  const installTitle =
    t(data?.heroInstallTitle ?? null) || "Wdrazamy dla najwiekszych marek.";
  const installSubtitle =
    t(data?.heroInstallSubtitle ?? null) ||
    "Sieci kosmetyczne, fashion, elektronika.";

  const BADGE_LAYOUT = [
    {
      cls: "top-[18vh] right-[11vw]",
      fallbackValue: "<10 s",
      fallbackLabel: "Czas odbioru",
    },
    {
      cls: "top-[44vh] right-[4vw]",
      fallbackValue: "Modulowy",
      fallbackLabel: "System skrytek",
    },
    {
      cls: "top-[58vh] left-[46vw]",
      fallbackValue: "API",
      fallbackLabel: "Integracja",
    },
  ];
  const badgeText = (i: number) => {
    const d = data?.heroBadges?.[i];
    return {
      value: t(d?.value ?? null) || BADGE_LAYOUT[i].fallbackValue,
      label: t(d?.label ?? null) || BADGE_LAYOUT[i].fallbackLabel,
    };
  };

  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const statsWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const badges = statsWrapRef.current
      ? Array.from(statsWrapRef.current.children)
      : [];
    const targets = [
      imageRef.current,
      contentRef.current,
      cardRef.current,
      ...badges,
    ].filter(Boolean);

    const card = cardRef.current;
    if (card) card.style.transition = "none";

    gsap.set(targets, { x: 0, y: 0 });
    gsap.fromTo(
      targets,
      { opacity: 0 },
      { opacity: 1, duration: 0.7, ease: "power2.out", stagger: 0.05 },
    );

    if (card)
      requestAnimationFrame(() => {
        card.style.transition = "";
      });
  }, [lang]);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen min-h-[720px] overflow-hidden flex items-stretch max-lg:h-auto max-lg:min-h-[100svh] max-lg:flex-col"
      style={{
        background:
          "linear-gradient(45deg, #ffffff 0%, #f4f2ee 35%, #e0ddd8 70%, #cbc8c2 100%)",
      }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 0% 100%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 60%)",
        }}
      />

      <h1
        ref={titleRef}
        className="pointer-events-none absolute select-none m-0 font-black tracking-tighter text-[#0f0f0f] leading-[0.78] max-lg:hidden"
        style={{
          left: "5vw",
          top: "calc(18vh + 60px)",
          right: "-2vw",
          fontSize: "clamp(3.5rem, 10vw, 11rem)",
          letterSpacing: "-0.06em",
          opacity: 0.1,
          zIndex: 1,
          whiteSpace: "nowrap",
        }}>
        pickupwall.
      </h1>
      <p
        aria-hidden="true"
        className="pointer-events-none absolute select-none m-0 font-black tracking-tighter text-[#0f0f0f] leading-[0.82] lg:hidden"
        style={{
          left: "-2vw",
          top: "9svh",
          right: "-2vw",
          fontSize: "clamp(4.5rem, 20vw, 8rem)",
          letterSpacing: "-0.06em",
          opacity: 0.13,
          zIndex: 1,
          whiteSpace: "nowrap",
        }}>
        pickupwall.
      </p>

      <div
        ref={contentRef}
        className="relative z-[2] flex flex-col justify-start pl-[5vw] pr-[2vw] pt-[18vh] w-[32%] 2xl:pl-[8vw] max-2xl:w-[34%] max-xl:w-[38%] max-lg:w-full max-lg:pl-[6vw] max-lg:pr-[6vw] max-lg:pt-[17svh]"
        style={{ opacity: 0, transform: "translateY(20px)" }}>
        <img
          src="/retailologo.webp"
          alt="retailo"
          className="block self-start h-[34px] w-auto mb-7 max-lg:hidden"
          style={{ width: "auto" }}
        />

        <div
          aria-hidden="true"
          className="hidden lg:block mb-7"
          style={{
            height: "clamp(3.4rem, 6.6vw, 7.6rem)",
            lineHeight: 0.9,
          }}
        />

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

      <div className="relative z-[2] flex-1 flex items-center justify-end pl-[6vw] pr-[14vw] pt-[10vh] pb-[8vh] max-lg:flex-none max-lg:pl-[2vw] max-lg:pr-[2vw] max-lg:justify-center max-lg:pt-0 max-lg:pb-0 max-lg:flex-col">
        <div
          aria-hidden="true"
          className="absolute bottom-[10vh] right-[20vw] pointer-events-none max-lg:hidden"
          style={{
            width: "40%",
            height: "60px",
            background:
              "radial-gradient(ellipse at center, rgba(15,15,15,0.18) 0%, rgba(15,15,15,0) 70%)",
            filter: "blur(14px)",
          }}
        />
        <img
          ref={imageRef}
          src={data?.heroImage || "/model3_retailo.png"}
          alt="PickUpWall"
          className="relative block h-[78vh] w-auto object-contain max-lg:h-[36svh]"
          style={{
            opacity: 0,
            transform: "translateX(-40px)",
            filter:
              "drop-shadow(0 18px 30px rgba(15,15,15,0.18)) drop-shadow(0 6px 12px rgba(15,15,15,0.10))",
          }}
        />
        <p
          className="hidden max-lg:block m-0 mt-[7svh] px-[6vw] text-[#3a3a3a] leading-relaxed font-light"
          style={{ fontSize: "0.95rem" }}>
          {description}
        </p>
      </div>

      <div ref={statsWrapRef} className="contents">
        {[
          {
            ...badgeText(0),
            cls: "top-[18vh] right-[11vw] max-lg:top-[18svh] max-lg:right-auto max-lg:left-[5vw]",
            icon: (
              <>
                <circle cx="12" cy="12" r="8.5" strokeWidth="1.4" />
                <path
                  d="M12 7.5v4.5l3 1.8"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ),
          },
          {
            ...badgeText(1),
            cls: "top-[44vh] right-[4vw] max-lg:top-[30svh] max-lg:right-[5vw]",
            icon: (
              <>
                <rect
                  x="3.5"
                  y="3.5"
                  width="7"
                  height="7"
                  rx="1"
                  strokeWidth="1.4"
                />
                <rect
                  x="13.5"
                  y="3.5"
                  width="7"
                  height="7"
                  rx="1"
                  strokeWidth="1.4"
                />
                <rect
                  x="3.5"
                  y="13.5"
                  width="7"
                  height="7"
                  rx="1"
                  strokeWidth="1.4"
                />
                <rect
                  x="13.5"
                  y="13.5"
                  width="7"
                  height="7"
                  rx="1"
                  strokeWidth="1.4"
                />
              </>
            ),
          },
          {
            ...badgeText(2),
            cls: "top-[58vh] left-[56vw] max-lg:top-[43svh] max-lg:left-[5vw]",
            icon: (
              <>
                <path
                  d="M7 9.5L4 12l3 2.5M17 9.5L20 12l-3 2.5M14 6l-4 12"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ),
          },
        ].map((b) => (
          <div
            key={b.label}
            className={`absolute z-[4] flex flex-col items-start gap-2 rounded-2xl px-4 py-3 text-left lg:backdrop-blur-md min-w-[120px] max-lg:min-w-[84px] max-lg:gap-1 max-lg:px-2 max-lg:py-1.5 max-lg:rounded-lg ${b.cls}`}
            style={{
              background: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(15,15,15,0.08)",
              boxShadow:
                "0 1px 2px rgba(15,15,15,0.04), 0 14px 32px rgba(15,15,15,0.10)",
              opacity: 0,
              transform: "translateY(20px)",
            }}>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full max-lg:h-6 max-lg:w-6"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(15,15,15,0.06)",
              }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0f0f0f"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-[17px] w-[17px] max-lg:h-3 max-lg:w-3">
                {b.icon}
              </svg>
            </span>
            <div className="flex flex-col items-start">
              <span className="font-medium text-[#0f0f0f] tracking-tight text-[0.92rem] leading-[1.1] max-lg:text-[0.72rem]">
                {b.value}
              </span>
              <span className="mt-0.5 uppercase tracking-[0.18em] font-medium text-[#7a7a7a] text-[0.55rem] max-lg:text-[0.46rem] max-lg:mt-0">
                {b.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <a
        ref={cardRef}
        href="/realizacje"
        className="absolute bottom-[5vh] left-[5vw] z-[5] flex w-[min(460px,40vw)] items-stretch overflow-hidden rounded-2xl no-underline lg:backdrop-blur-md transition-transform hover:-translate-y-0.5 2xl:left-[8vw] max-lg:relative max-lg:bottom-auto max-lg:left-auto max-lg:mt-[5svh] max-lg:mb-[0.5svh] max-lg:mx-[5vw] max-lg:!w-[calc(100%-10vw)]"
        style={{
          background: "rgba(225,225,222,0.55)",
          border: "1px solid rgba(15,15,15,0.08)",
          boxShadow:
            "0 1px 2px rgba(15,15,15,0.04), 0 18px 40px rgba(15,15,15,0.10)",
          opacity: 0,
          transform: "translateY(20px)",
          minHeight: "150px",
        }}>
        <div
          className="flex w-[170px] shrink-0 items-center justify-center overflow-hidden self-stretch max-lg:w-[110px]"
          style={{ background: "rgba(240,239,235,0.7)" }}>
          <img
            src={data?.heroInstallImage || "/sephora-pickupwall.jpeg"}
            alt="Wdrozenie PickUpWall"
            className="block h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-1 items-center justify-between gap-2.5 px-4 py-3 max-lg:px-3">
          <div className="flex-1 min-w-0">
            <span
              className="block uppercase tracking-[0.24em] font-semibold text-[#7a7a7a] mb-1"
              style={{ fontSize: "0.56rem" }}>
              {installEyebrow}
            </span>
            <p
              className="m-0 mb-0.5 font-bold tracking-tight text-[#0f0f0f] max-lg:text-[0.92rem] max-lg:leading-tight"
              style={{
                fontSize: "clamp(1rem, 1.15vw, 1.2rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}>
              {installTitle}
            </p>
            <p
              className="m-0 text-[#5a5a5a] font-light max-lg:hidden"
              style={{ fontSize: "0.72rem", lineHeight: 1.4 }}>
              {installSubtitle}
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
    </section>
  );
}
