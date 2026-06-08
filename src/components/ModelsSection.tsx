"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { HomePage } from "@/lib/sanity/fetch";

const SIDE_TONE = "rgb(212, 214, 216)";
const SIDE_TONE_BG = "rgba(212, 214, 216, 0.42)";
const CENTER_TONE = "rgb(172, 170, 165)";
const CENTER_TONE_BG = "rgba(172, 170, 165, 0.48)";

const FALLBACK_MODELS = [
  {
    img: "/model2_retailo.png",
    name: "PickUpWall M",
    desc: "Kompaktowa konfiguracja PickUpWall dla sklepow o duzym ruchu, zoptymalizowana pod paczki o roznych wymiarach.",
    featured: false,
  },
  {
    img: "/model3_retailo.png",
    name: "PickUpWall L",
    desc: "Standardowa konfiguracja PickUpWall dla sklepow o duzym ruchu, zoptymalizowana pod paczki o roznych wymiarach.",
    featured: true,
  },
  {
    img: "/model4_retailo.png",
    name: "PickUpWall XL",
    desc: "Rozszerzona konfiguracja PickUpWall dla sklepow o duzym ruchu, zoptymalizowana pod paczki o roznych wymiarach.",
    featured: false,
  },
];

export default function ModelsSection({ data }: { data?: HomePage } = {}) {
  const { t } = useLang();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const headline =
    t(data?.modelsHeadline ?? null) || "Poznaj modele PickUpWall";

  const sanityModels = (data?.models ?? [])
    .map((m) => ({
      img: m.image || "",
      name: t(m.name ?? null),
      desc: t(m.description ?? null),
      featured: !!m.featured,
    }))
    .filter((m) => m.name);
  const MODELS = (sanityModels.length ? sanityModels : FALLBACK_MODELS).map(
    (m) => ({
      ...m,
      cardBg: m.featured ? CENTER_TONE_BG : SIDE_TONE_BG,
      circleColor: m.featured ? CENTER_TONE : SIDE_TONE,
    }),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = Array.from(scroller.children) as HTMLElement[];
    if (cards.length === 0) return;
    const ratios = new Array(cards.length).fill(0);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = cards.indexOf(entry.target as HTMLElement);
          if (idx >= 0) ratios[idx] = entry.intersectionRatio;
        }
        let bestIdx = 0;
        let best = -1;
        for (let i = 0; i < ratios.length; i++) {
          if (ratios[i] > best) {
            best = ratios[i];
            bestIdx = i;
          }
        }
        setActiveIdx(bestIdx);
      },
      { root: scroller, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  const scrollToCard = (i: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.firstElementChild as HTMLElement | null;
    if (!card) return;
    scroller.scrollTo({
      left: i * (card.offsetWidth + 16),
      behavior: "smooth",
    });
  };

  return (
    <section
      className="relative w-full pt-[6vh] pb-[12vh] px-[6vw] max-lg:pt-[4vh] max-lg:pb-[3vh] max-lg:px-[6vw]"
      style={{ background: "#ffffff" }}>
      <div className="max-w-[1320px] mx-auto">
        <h2
          className="text-center font-bold uppercase tracking-[0.18em] text-[#0a2a2e] m-0 mb-24 max-lg:mb-4"
          style={{
            fontSize: "clamp(1.4rem, 2.6vw, 2.4rem)",
            letterSpacing: "0.14em",
          }}>
          {headline}
        </h2>

        <div className="grid grid-cols-3 gap-7 items-center max-xl:gap-5 max-lg:hidden">
          {MODELS.map((m) => (
            <article
              key={m.name}
              className={`relative flex flex-col rounded-2xl transition-transform duration-300 hover:-translate-y-1 ${
                m.featured ? "pt-0 pb-20" : "pt-7 pb-7"
              }`}
              style={{
                background: m.cardBg,
                boxShadow: m.featured
                  ? "0 24px 56px rgba(15,42,46,0.10)"
                  : "0 14px 40px rgba(15,42,46,0.06)",
                overflow: "visible",
              }}>
              <div
                className={`relative flex items-end justify-center px-6 ${
                  m.featured ? "-mt-[14%] mb-3" : "mb-3"
                }`}
                style={{ aspectRatio: m.featured ? "5 / 5.2" : "5 / 3.6" }}>
                <div
                  aria-hidden="true"
                  className="absolute"
                  style={{
                    aspectRatio: "1 / 1",
                    width: m.featured ? "56%" : "58%",
                    bottom: m.featured ? "8%" : "12%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    borderRadius: "9999px",
                    background: m.circleColor,
                  }}
                />
                <img
                  src={m.img}
                  alt={m.name}
                  className={`relative z-[1] object-contain ${
                    m.featured ? "max-h-[500px]" : "max-h-[300px]"
                  } max-w-full`}
                />
              </div>

              <div className="flex flex-col items-center text-center px-6 gap-2">
                <h3
                  className="m-0 font-semibold uppercase tracking-[0.16em] text-[#0a2a2e]"
                  style={{
                    fontSize: m.featured
                      ? "clamp(1.05rem, 1.25vw, 1.25rem)"
                      : "clamp(0.95rem, 1.1vw, 1.1rem)",
                  }}>
                  {m.name}
                </h3>
                <p
                  className="m-0 text-[#3a5a60] leading-relaxed font-light"
                  style={{ fontSize: "clamp(0.82rem, 0.9vw, 0.92rem)" }}>
                  {m.desc}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="lg:hidden -mx-[6vw]">
          <div
            ref={scrollerRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-[6vw] pt-4 pb-10 no-scrollbar"
            style={{ scrollPaddingInline: "6vw" }}>
            {MODELS.map((m) => (
              <article
                key={m.name}
                className="flex-none w-[78vw] max-w-[360px] snap-center relative flex flex-col rounded-2xl pt-7 pb-7"
                style={{
                  background: m.cardBg,
                  boxShadow: "0 14px 40px rgba(15,42,46,0.08)",
                  overflow: "visible",
                }}>
                <div
                  className="relative flex items-end justify-center px-5 mb-3"
                  style={{ aspectRatio: "5 / 3.8" }}>
                  <div
                    aria-hidden="true"
                    className="absolute"
                    style={{
                      aspectRatio: "1 / 1",
                      width: "58%",
                      bottom: "12%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderRadius: "9999px",
                      background: m.circleColor,
                    }}
                  />
                  <img
                    src={m.img}
                    alt={m.name}
                    className="relative z-[1] object-contain max-h-[240px] max-w-full"
                  />
                </div>
                <div className="flex flex-col items-center text-center px-5 gap-2">
                  <h3
                    className="m-0 font-semibold uppercase tracking-[0.16em] text-[#0a2a2e]"
                    style={{ fontSize: "1.05rem" }}>
                    {m.name}
                  </h3>
                  <p
                    className="m-0 text-[#3a5a60] leading-relaxed font-light"
                    style={{ fontSize: "0.88rem" }}>
                    {m.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="flex justify-center gap-2 -mt-2 px-[6vw]">
            {MODELS.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Model ${i + 1}`}
                onClick={() => scrollToCard(i)}
                className="cursor-pointer p-0 m-0 border-0 bg-transparent">
                <span
                  className="block transition-all duration-300 rounded-full"
                  style={{
                    width: i === activeIdx ? "24px" : "8px",
                    height: "8px",
                    background:
                      i === activeIdx
                        ? "#0a2a2e"
                        : "rgba(15,42,46,0.18)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
