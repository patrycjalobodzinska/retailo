"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { LocalizedField } from "@/lib/sanity/i18n";

type QAData = {
  qaEyebrow?: LocalizedField;
  qaHeadline?: LocalizedField;
  qaSubtitle?: LocalizedField;
  qaTiles?: Array<{ title?: LocalizedField; description?: LocalizedField }>;
} | null;

function TileIcon({
  kind,
  stroke = "#0f0f0f",
  size = 26,
}: {
  kind: string;
  stroke?: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (kind) {
    case "Modularnosc":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "Skalowalnosc":
      return (
        <svg {...common}>
          <path d="M4 14v6h6" />
          <path d="M20 10V4h-6" />
          <path d="M14 4l6 6M10 20l-6-6" />
        </svg>
      );
    case "Personalizacja":
      return (
        <svg {...common}>
          <path d="M12 21a9 9 0 1 1 9-9c0 2-1 3-3 3h-2a2 2 0 0 0 0 4 2 2 0 0 1-2 2h-2z" />
          <circle cx="7.5" cy="10.5" r="1" fill={stroke} stroke="none" />
          <circle cx="12" cy="7.5" r="1" fill={stroke} stroke="none" />
          <circle cx="16.5" cy="10.5" r="1" fill={stroke} stroke="none" />
        </svg>
      );
    case "Uniwersalnosc":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "Bezpieczenstwo":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "Wydajnosc":
      return (
        <svg {...common}>
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      );
    default:
      return null;
  }
}

const SMALL_TILES = [
  {
    kind: "Modularnosc",
    title: "Modularnosc",
    desc: "Wielkosc i liczba skrytek dostosowana do potrzeb i specyfiki branzy klienta.",
    accent: "#0086b0",
  },
  {
    kind: "Skalowalnosc",
    title: "Skalowalnosc",
    desc: "Mozliwosc instalowania dodatkowych modulow.",
    accent: "#34d399",
  },
  {
    kind: "Bezpieczenstwo",
    title: "Bezpieczenstwo",
    desc: "Bezdotykowa, bezkontaktowa obsluga zwieksza bezpieczenstwo klientow i sluzb sprzedazy.",
    accent: "#f59e0b",
  },
  {
    kind: "Uniwersalnosc",
    title: "Uniwersalnosc",
    desc: "Wymiary modulow w zgodzie ze standardami zabudow meblowych w retailu.",
    accent: "#a855f7",
  },
];

const COLOR_SWATCHES = [
  { color: "#0f0f0f", label: "Czern" },
  { color: "#f5f3ee", label: "Biel" },
  { color: "#0086b0", label: "Cyjan" },
  { color: "#d4c5a8", label: "Piasek" },
];

const BG_COLOR = "#fafaf8";

export default function QASection({ data }: { data?: QAData } = {}) {
  const { t } = useLang();
  const eyebrow = t(data?.qaEyebrow ?? null) || "Nasze rozwiazanie";
  const headline = t(data?.qaHeadline ?? null) || "PickUpWall.";
  const subtitle =
    t(data?.qaSubtitle ?? null) ||
    'PickUpWall to rozwiazanie do zamowien typu "pick up in store".';

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Mobile snap-scroll active dot tracker
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobile) return;
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

  // Desktop reveal animations removed — sekcja renderuje się od razu
  // statycznie (bez slide-in z dołu). Karty zostawiały artefakty przy
  // scrollu w górę i utrzymywanie tej animacji nie wnosiło wartości.

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

  const allMobileTiles = [
    ...SMALL_TILES,
    {
      kind: "Personalizacja",
      title: "Personalizacja",
      desc: "Dedykowane grafiki i kolor obudowy. Opcjonalny ekran Digital Signage.",
      accent: "#0086b0",
    },
    {
      kind: "Wydajnosc",
      title: "Wydajnosc",
      desc: "Odbior ponizej 15 sekund, krotsze kolejki i zwolnienie przestrzeni magazynowej zaplecza.",
      accent: "#0f0f0f",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-[12vh] max-lg:pt-[6dvh] max-lg:pb-[6dvh] overflow-hidden"
      style={{ background: BG_COLOR }}>
      {/* MOBILE: horizontal snap carousel using the desktop bento card design */}
      <div className="lg:hidden relative">
        <div className="relative z-[1] mb-7 max-w-[520px] px-[6vw]">
          <p
            className="m-0 mb-3 uppercase tracking-[0.28em] font-semibold text-[#7a7a7a]"
            style={{ fontSize: "0.68rem" }}>
            {eyebrow}
          </p>
          <h2
            className="m-0 mb-3 font-semibold text-[#0f0f0f] tracking-tight"
            style={{
              fontSize: "clamp(1.9rem, 8vw, 2.6rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}>
            {headline}
          </h2>
          <p
            className="m-0 text-[#5a5a5a] font-light"
            style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>

        <div
          ref={scrollerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-[6vw] pb-10 no-scrollbar"
          style={{ scrollPaddingInline: "6vw" }}>
          {/* Personalizacja */}
          <article
            className="flex-none w-[82vw] snap-center relative rounded-3xl overflow-hidden p-6 flex flex-col justify-between"
            style={{
              background:
                "linear-gradient(135deg, #ecebe6 0%, #dedcd6 60%, #cdcac3 100%)",
              minHeight: "320px",
              border: "1px solid rgba(15,15,15,0.06)",
              boxShadow:
                "0 1px 2px rgba(15,15,15,0.04), 0 14px 32px rgba(15,15,15,0.06)",
            }}>
            <img
              src="/empik.png"
              alt=""
              aria-hidden="true"
              className="absolute pointer-events-none select-none"
              style={{
                right: "-2%",
                bottom: "-4%",
                width: "56%",
                opacity: 0.95,
                filter: "drop-shadow(0 16px 28px rgba(15,15,15,0.22))",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                top: "-20%",
                left: "-10%",
                width: "60%",
                height: "60%",
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)",
              }}
            />

            <div className="relative z-[1] max-w-[160px]">
              <div
                className="inline-flex items-center justify-center rounded-2xl mb-4"
                style={{
                  width: 44,
                  height: 44,
                  background: "rgba(15,15,15,0.05)",
                  border: "1px solid rgba(15,15,15,0.06)",
                }}>
                <TileIcon kind="Personalizacja" stroke="#0f0f0f" size={20} />
              </div>
              <h3
                className="m-0 mb-2 text-[#0f0f0f] font-semibold tracking-tight"
                style={{
                  fontSize: "1.45rem",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}>
                Personalizacja.
              </h3>
              <p
                className="m-0 text-[#5a5a5a] leading-relaxed font-light"
                style={{ fontSize: "0.85rem", maxWidth: "150px" }}>
                Dedykowane grafiki i kolor obudowy.
              </p>
            </div>

            <div className="relative z-[1] flex items-center gap-2 mt-4">
              {COLOR_SWATCHES.map((swatch) => (
                <span
                  key={swatch.color}
                  aria-label={swatch.label}
                  title={swatch.label}
                  className="block rounded-full"
                  style={{
                    width: 24,
                    height: 24,
                    background: swatch.color,
                    border: "2px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 10px rgba(15,15,15,0.18)",
                  }}
                />
              ))}
            </div>
          </article>

          {/* Wydajnosc */}
          <article
            className="flex-none w-[82vw] snap-center relative rounded-3xl overflow-hidden p-6 flex flex-col justify-between"
            style={{
              background: "white",
              minHeight: "320px",
              border: "1px solid rgba(15,15,15,0.06)",
              boxShadow:
                "0 1px 2px rgba(15,15,15,0.04), 0 14px 32px rgba(15,15,15,0.06)",
            }}>
            <svg
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                left: 0,
                right: 0,
                bottom: "-15%",
                width: "100%",
                opacity: 0.08,
              }}
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
              fill="none">
              {Array.from({ length: 14 }).map((_, i) => (
                <path
                  key={i}
                  d={`M-50 ${30 + i * 10} Q 100 ${100 - i * 6} 200 ${
                    80 + i * 8
                  } T 450 ${60 + i * 5}`}
                  stroke="#0f0f0f"
                  strokeWidth="0.8"
                  fill="none"
                />
              ))}
            </svg>

            <div className="relative z-[1]">
              <div
                className="inline-flex items-center justify-center rounded-2xl mb-4"
                style={{
                  width: 44,
                  height: 44,
                  background: "rgba(15,15,15,0.05)",
                }}>
                <TileIcon kind="Wydajnosc" size={20} />
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className="font-semibold text-[#0f0f0f] leading-none tracking-tighter"
                  style={{ fontSize: "2.8rem", letterSpacing: "-0.04em" }}>
                  &lt;15s
                </span>
              </div>
              <h3
                className="m-0 mb-2 font-semibold text-[#0f0f0f] tracking-tight"
                style={{
                  fontSize: "1.3rem",
                  lineHeight: 1.1,
                  letterSpacing: "-0.015em",
                }}>
                Wydajnosc.
              </h3>
              <p
                className="m-0 text-[#5a5a5a] leading-relaxed font-light"
                style={{ fontSize: "0.88rem" }}>
                Odbior ponizej 15 sekund, krotsze kolejki.
              </p>
            </div>
          </article>

          {/* Small tiles — grouped 2 per snap slide, stacked vertically. */}
          {Array.from({ length: Math.ceil(SMALL_TILES.length / 2) }).map(
            (_, slideIdx) => (
              <div
                key={`tile-slide-${slideIdx}`}
                className="flex-none w-[82vw] snap-center flex flex-col gap-3"
                style={{ minHeight: "320px" }}>
                {SMALL_TILES.slice(slideIdx * 2, slideIdx * 2 + 2).map(
                  (tile) => (
                    <article
                      key={tile.title}
                      className="relative bg-white rounded-3xl p-5 flex flex-1 flex-col gap-2"
                      style={{
                        border: "1px solid rgba(15,15,15,0.06)",
                        boxShadow:
                          "0 1px 2px rgba(15,15,15,0.04), 0 14px 32px rgba(15,15,15,0.06)",
                      }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center rounded-xl shrink-0"
                          style={{
                            width: 40,
                            height: 40,
                            background: "rgba(15,15,15,0.05)",
                          }}>
                          <TileIcon kind={tile.kind} size={20} />
                        </div>
                        <h3
                          className="m-0 font-semibold text-[#0f0f0f] tracking-tight"
                          style={{
                            fontSize: "1.05rem",
                            lineHeight: 1.15,
                            letterSpacing: "-0.015em",
                          }}>
                          {tile.title}
                        </h3>
                      </div>
                      <p
                        className="m-0 text-[#5a5a5a] leading-relaxed font-light"
                        style={{ fontSize: "0.88rem" }}>
                        {tile.desc}
                      </p>
                    </article>
                  ),
                )}
              </div>
            ),
          )}
        </div>

        {/* Pagination dots — tight under cards, inside shadow zone */}
        <div className="flex justify-center gap-2 -mt-2 px-[6vw]">
          {Array.from({
            length: 2 + Math.ceil(SMALL_TILES.length / 2),
          }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Karta ${i + 1}`}
              onClick={() => scrollToCard(i)}
              className="cursor-pointer p-0 m-0 border-0 bg-transparent">
              <span
                className="block transition-all duration-300 rounded-full"
                style={{
                  width: i === activeIdx ? "24px" : "8px",
                  height: "8px",
                  background:
                    i === activeIdx ? "#0f0f0f" : "rgba(15,15,15,0.18)",
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Decorative background — watermark + dot grid + radial accents */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden max-lg:hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 110%, rgba(15,15,15,0.04) 0%, rgba(15,15,15,0) 60%), radial-gradient(ellipse 60% 50% at 90% -10%, rgba(15,15,15,0.03) 0%, rgba(15,15,15,0) 60%)",
        }}>
        <div
          className="absolute"
          style={{
            top: "8vh",
            left: "8vw",
            width: "48px",
            height: "1px",
            background: "#0f0f0f",
          }}
        />
      </div>

      {/* DESKTOP: bento layout */}
      <div className="max-lg:hidden relative max-w-[1280px] mx-auto px-[6vw]">
        {/* Header */}
        <div
          ref={headerRef}
          className="mb-10 max-w-[680px]"
          style={{ transform: "translateY(40px)" }}>
          <span
            className="block uppercase tracking-[0.3em] font-semibold text-[#7a7a7a] mb-4"
            style={{ fontSize: "0.72rem" }}>
            {eyebrow}
          </span>
          <h2
            className="m-0 mb-4 font-semibold text-[#0f0f0f] tracking-tight"
            style={{
              fontSize: "clamp(2rem, 3.8vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
            }}>
            {headline}
          </h2>
          <p
            className="m-0 text-[#5a5a5a] font-light leading-relaxed"
            style={{
              fontSize: "clamp(1rem, 1.1vw, 1.13rem)",
              maxWidth: "560px",
            }}>
            {subtitle}
          </p>
        </div>

        {/* Featured row — 2 wide cards (Bezpieczenstwo dark + Wydajnosc light) */}
        <div ref={featuredRef} className="grid grid-cols-2 gap-5 mb-5">
          {/* DARK CARD — Personalizacja with bleeding image + color swatches */}
          <article
            className="relative rounded-3xl overflow-hidden p-7 flex flex-col justify-between"
            style={{
              background:
                "linear-gradient(135deg, #ecebe6 0%, #dedcd6 60%, #cdcac3 100%)",
              minHeight: "340px",
              border: "1px solid rgba(15,15,15,0.06)",
              boxShadow:
                "0 1px 2px rgba(15,15,15,0.04), 0 14px 32px rgba(15,15,15,0.06)",
            }}>
            <img
              src="/empik.png"
              alt=""
              aria-hidden="true"
              className="absolute pointer-events-none select-none"
              style={{
                right: "-8%",
                bottom: "-18%",
                width: "52%",
                opacity: 0.95,
                filter: "drop-shadow(0 20px 36px rgba(15,15,15,0.22))",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                top: "-20%",
                left: "-10%",
                width: "60%",
                height: "60%",
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)",
              }}
            />

            <div className="relative z-[1] max-w-[240px]">
              <div
                className="inline-flex items-center justify-center rounded-2xl mb-5"
                style={{
                  width: 48,
                  height: 48,
                  background: "rgba(15,15,15,0.05)",
                  border: "1px solid rgba(15,15,15,0.06)",
                }}>
                <TileIcon kind="Personalizacja" stroke="#0f0f0f" size={22} />
              </div>
              <h3
                className="m-0 mb-3 text-[#0f0f0f] font-semibold tracking-tight"
                style={{
                  fontSize: "clamp(1.35rem, 1.85vw, 1.8rem)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}>
                Personalizacja.
              </h3>
              <p
                className="m-0 text-[#5a5a5a] leading-relaxed font-light"
                style={{ fontSize: "0.95rem" }}>
                Dedykowane grafiki i kolor obudowy. Opcjonalny ekran Digital
                Signage pod brand klienta.
              </p>
            </div>

            <div className="relative z-[1] flex items-center gap-2 mt-5">
              {COLOR_SWATCHES.map((swatch) => (
                <span
                  key={swatch.color}
                  aria-label={swatch.label}
                  title={swatch.label}
                  className="block rounded-full"
                  style={{
                    width: 28,
                    height: 28,
                    background: swatch.color,
                    border: "2px solid rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 10px rgba(15,15,15,0.18)",
                  }}
                />
              ))}
            </div>
          </article>

          {/* LIGHT CARD — Wydajnosc with giant <15s + wave illustration */}
          <article
            className="relative rounded-3xl overflow-hidden p-7 flex flex-col justify-between"
            style={{
              background: "white",
              minHeight: "340px",
              border: "1px solid rgba(15,15,15,0.06)",
              boxShadow:
                "0 1px 2px rgba(15,15,15,0.04), 0 14px 32px rgba(15,15,15,0.06)",
            }}>
            <svg
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                left: 0,
                right: 0,
                bottom: "-15%",
                width: "100%",
                opacity: 0.08,
              }}
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
              fill="none">
              {Array.from({ length: 14 }).map((_, i) => (
                <path
                  key={i}
                  d={`M-50 ${30 + i * 10} Q 100 ${100 - i * 6} 200 ${
                    80 + i * 8
                  } T 450 ${60 + i * 5}`}
                  stroke="#0f0f0f"
                  strokeWidth="0.8"
                  fill="none"
                />
              ))}
            </svg>

            <div className="relative z-[1]">
              <div
                className="inline-flex items-center justify-center rounded-2xl mb-5"
                style={{
                  width: 48,
                  height: 48,
                  background: "rgba(15,15,15,0.05)",
                }}>
                <TileIcon kind="Wydajnosc" size={22} />
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span
                  className="font-semibold text-[#0f0f0f] leading-none tracking-tighter"
                  style={{
                    fontSize: "clamp(2.6rem, 3.8vw, 3.8rem)",
                    letterSpacing: "-0.04em",
                  }}>
                  &lt;15s
                </span>
              </div>
              <h3
                className="m-0 mb-2 font-semibold text-[#0f0f0f] tracking-tight"
                style={{
                  fontSize: "clamp(1.25rem, 1.7vw, 1.6rem)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.015em",
                }}>
                Wydajnosc.
              </h3>
              <p
                className="m-0 text-[#5a5a5a] leading-relaxed font-light max-w-[360px]"
                style={{ fontSize: "0.95rem" }}>
                Odbior ponizej 15 sekund, krotsze kolejki i zwolnienie
                przestrzeni magazynowej zaplecza.
              </p>
            </div>
          </article>
        </div>

        {/* Small tiles row — 4 cards */}
        <div ref={tilesRef} className="grid grid-cols-4 gap-5">
          {SMALL_TILES.map((tile) => (
            <article
              key={tile.title}
              className="relative bg-white rounded-2xl p-6 flex flex-col gap-3"
              style={{
                border: "1px solid rgba(15,15,15,0.06)",
                boxShadow:
                  "0 1px 2px rgba(15,15,15,0.04), 0 12px 28px rgba(15,15,15,0.05)",
              }}>
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: 42,
                    height: 42,
                    background: "rgba(15,15,15,0.05)",
                  }}>
                  <TileIcon kind={tile.kind} size={22} />
                </div>
              </div>
              <h3
                className="m-0 mt-1 font-semibold text-[#0f0f0f] tracking-tight"
                style={{
                  fontSize: "clamp(1rem, 1.2vw, 1.2rem)",
                  lineHeight: 1.2,
                }}>
                {tile.title}
              </h3>
              <p
                className="m-0 text-[#5a5a5a] leading-relaxed font-light"
                style={{ fontSize: "clamp(0.85rem, 0.98vw, 0.95rem)" }}>
                {tile.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
