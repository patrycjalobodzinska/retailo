"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { LocalizedField } from "@/lib/sanity/i18n";

gsap.registerPlugin(ScrollTrigger);

type QAData = {
  qaEyebrow?: LocalizedField;
  qaHeadline?: LocalizedField;
  qaSubtitle?: LocalizedField;
  qaTiles?: Array<{ title?: LocalizedField; description?: LocalizedField }>;
} | null;

// Per-tile inline SVGs. Stroke-only, cyan brand color, 1.6 width — match
// the lightweight industrial vibe of the rest of the section without
// pulling in an icon library.
function TileIcon({ kind }: { kind: string }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "#0086b0",
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
          <circle cx="7.5" cy="10.5" r="1" fill="#0086b0" stroke="none" />
          <circle cx="12" cy="7.5" r="1" fill="#0086b0" stroke="none" />
          <circle cx="16.5" cy="10.5" r="1" fill="#0086b0" stroke="none" />
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

const TILES: { title: string; desc: string }[] = [
  {
    title: "Modularnosc",
    desc: "Wielkosc i liczba skrytek dostosowana do potrzeb i specyfiki branzy klienta.",
  },
  {
    title: "Skalowalnosc",
    desc: "Mozliwosc instalowania dodatkowych modulow.",
  },
  {
    title: "Personalizacja",
    desc: "Dedykowane grafiki i kolor obudowy. Opcjonalny ekran Digital Signage.",
  },
  {
    title: "Uniwersalnosc",
    desc: "Wymiary modulow w zgodzie ze standardami zabudow meblowych w retailu.",
  },
  {
    title: "Bezpieczenstwo",
    desc: "Bezdotykowa, bezkontaktowa obsluga zwieksza bezpieczenstwo klientow i sluzb sprzedazy.",
  },
  {
    title: "Wydajnosc",
    desc: "Odbior ponizej 15 sekund, krotsze kolejki i zwolnienie przestrzeni magazynowej zaplecza.",
  },
];

const BG_COLOR = "#c0dbe2";
const COL_INITIAL_Y = ["55vh", "32vh", "78vh"];

export default function QASection({ data }: { data?: QAData } = {}) {
  const { t } = useLang();
  const eyebrow = t(data?.qaEyebrow ?? null) || "Nasze rozwiazanie";
  const headline = t(data?.qaHeadline ?? null) || "PickUpWall.";
  const subtitle =
    t(data?.qaSubtitle ?? null) ||
    'PickUpWall to rozwiazanie do zamowien typu "pick up in store".';
  const tiles =
    data?.qaTiles && data.qaTiles.length > 0
      ? data.qaTiles.map((tile) => ({
          title: t(tile?.title ?? null),
          desc: t(tile?.description ?? null),
        }))
      : TILES;

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;

    if (isMobile) {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const cards = Array.from(scroller.children) as HTMLElement[];
      if (cards.length === 0) return;

      // Pick whichever card is most-visible inside the scroller as the
      // active one. IntersectionObserver fires reliably across snap-scroll
      // momentum on iOS/Android, unlike raw scroll-position math.
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
        {
          root: scroller,
          threshold: [0, 0.25, 0.5, 0.75, 1],
        },
      );

      cards.forEach((c) => observer.observe(c));
      return () => observer.disconnect();
    }

    const ctx = gsap.context(() => {
      const tiles = tileRefs.current.filter(Boolean) as HTMLDivElement[];

      tiles.forEach((el, i) => {
        const col = i % 3;
        gsap.set(el, { y: COL_INITIAL_Y[col] });
      });

      gsap.to(tiles, {
        y: 0,
        ease: "power2.out",
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=120%",
          pin: pinRef.current,
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
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
      ref={sectionRef}
      className="relative w-full"
      style={{ background: BG_COLOR }}>
      {/* MOBILE: header + horizontal snap-scroll cards + pagination dots */}
      <div className="lg:hidden relative py-[10vh] overflow-hidden">
        {/* Decorative watermark — same idea as desktop, scaled for mobile. */}
        <p
          aria-hidden="true"
          className="absolute m-0 font-black select-none pointer-events-none"
          style={{
            bottom: "3vh",
            left: "-3vw",
            fontSize: "40vw",
            lineHeight: 1.2,
            letterSpacing: "-0.05em",
            color: "rgba(255,255,255,0.55)",
            zIndex: 0,
          }}>
          pickup.
        </p>
        <div className="relative z-[1] text-center px-[6vw] mb-8">
          <p
            className="m-0 mb-3 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
            style={{ fontSize: "0.72rem" }}>
            {eyebrow}
          </p>
          <h2
            className="m-0 mb-3 font-bold text-[#0a2a2e]"
            style={{
              fontSize: "clamp(1.9rem, 8vw, 2.6rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}>
            {headline}
          </h2>
          <p
            className="m-0 mx-auto text-[#3a5a60]"
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.5,
              maxWidth: "440px",
            }}>
            {subtitle}
          </p>
        </div>

        <div
          ref={scrollerRef}
          className="relative z-[1] flex overflow-x-auto snap-x snap-mandatory gap-4 px-[6vw] pb-4 no-scrollbar"
          style={{ scrollPadding: "0 6vw" }}>
          {tiles.map((tile, i) => (
            <div
              key={tile.title}
              className="flex-none w-[82vw] snap-center bg-white rounded-2xl p-7 flex flex-col gap-3"
              style={{
                boxShadow: "0 12px 28px rgba(10, 30, 38, 0.10)",
                minHeight: "260px",
              }}>
              <div className="flex items-center justify-between">
                <span
                  className="text-[#0086b0] font-bold uppercase tracking-widest"
                  style={{ fontSize: "0.78rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <TileIcon kind={tile.title} />
              </div>
              <h3
                className="m-0 font-bold text-[#0a2a2e] uppercase tracking-wide"
                style={{ fontSize: "1.35rem", lineHeight: 1.2 }}>
                {tile.title}
              </h3>
              <p
                className="m-0 text-[#3a5a60] leading-relaxed"
                style={{ fontSize: "0.98rem" }}>
                {tile.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="relative z-[1] flex justify-center gap-2 mt-5 px-[6vw]">
          {tiles.map((_, i) => (
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
                    i === activeIdx ? "#0086b0" : "rgba(0,134,176,0.25)",
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* DESKTOP: pinned 6-tile staircase wave */}
      <div
        ref={pinRef}
        className="max-lg:hidden h-screen min-h-[640px] w-full relative overflow-hidden">
        {/* Decorative background — gradient wash + giant watermark word +
            accent dots/lines. Pointer-events-none so nothing interferes
            with the staircase tiles in front. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 15% 110%, rgba(0,134,176,0.18) 0%, rgba(0,134,176,0) 60%), radial-gradient(ellipse 60% 50% at 90% -10%, rgba(126,213,230,0.25) 0%, rgba(126,213,230,0) 60%)",
          }}
        />
        <p
          aria-hidden="true"
          className="absolute m-0 font-black select-none pointer-events-none"
          style={{
            // lineHeight 1.2 contains the Roboto Black descender inside
            // the element box; bottom: 3vh leaves just enough margin so
            // the glyph doesn't kiss the section edge but the watermark
            // still reads as anchored to the bottom.
            bottom: 0,
            left: "-2vw",
            fontSize: "clamp(11rem, 20vw, 26rem)",
            lineHeight: 1.2,
            letterSpacing: "-0.05em",
            color: "rgba(255,255,255,0.55)",
            zIndex: 0,
          }}>
          pickup.
        </p>

        {/* Accent dot grid in the bottom-right corner */}
        <svg
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{ bottom: "6vh", right: "5vw", opacity: 0.4 }}
          width="120"
          height="80"
          viewBox="0 0 120 80">
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 9 }).map((_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * 14 + 4}
                cy={row * 14 + 4}
                r="1.4"
                fill="#0086b0"
              />
            )),
          )}
        </svg>
        {/* Cyan accent stripe near the heading */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: "8vh",
            left: "8vw",
            width: "60px",
            height: "3px",
            background: "#0086b0",
          }}
        />
        <div className="relative z-[1] text-center max-w-[760px] mx-auto px-[6vw] pt-[10vh] pb-[2vh]">
          <p
            className="m-0 mb-3 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
            style={{ fontSize: "clamp(0.72rem, 0.8vw, 0.85rem)" }}>
            {eyebrow}
          </p>
          <h2
            className="m-0 mb-4 font-bold text-[#0a2a2e]"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.4rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}>
            {headline}
          </h2>
          <p
            className="m-0 mx-auto text-[#3a5a60]"
            style={{
              fontSize: "clamp(1rem, 1.2vw, 1.15rem)",
              lineHeight: 1.5,
              maxWidth: "560px",
            }}>
            {subtitle}
          </p>
        </div>

        <div className="relative z-[1] grid grid-cols-3 gap-6 px-[6vw] mt-[3vh]">
          {tiles.map((tile, i) => (
            <div
              key={tile.title}
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              className="bg-white p-8 rounded-md flex flex-col gap-3 will-change-transform"
              style={{ boxShadow: "0 6px 22px rgba(10, 30, 38, 0.06)" }}>
              <div className="flex items-center justify-between">
                <span
                  className="text-[#0086b0] font-bold uppercase tracking-widest"
                  style={{ fontSize: "0.78rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <TileIcon kind={tile.title} />
              </div>
              <h3
                className="m-0 font-bold text-[#0a2a2e] uppercase tracking-wide"
                style={{
                  fontSize: "clamp(1.05rem, 1.3vw, 1.3rem)",
                  lineHeight: 1.25,
                }}>
                {tile.title}
              </h3>
              <p
                className="m-0 text-[#3a5a60] leading-relaxed"
                style={{ fontSize: "clamp(0.9rem, 1.05vw, 1rem)" }}>
                {tile.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
