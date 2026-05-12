"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = [
  {
    n: "1",
    title: "Integracja",
    desc: "Gwarantujemy elastycznosc w integracji - w sposobie komunikacji, jak i zakresie przesylanych danych.",
  },
  {
    n: "2",
    title: "RODO",
    desc: "Zagwarantujemy zgodnosc z zasadami przetwarzania danych osobowych.",
  },
  {
    n: "3",
    title: "Instalacja",
    desc: "Instalacja i konfiguracja systemu z klientem, upewnienie sie czy zakres jest adekwatny do oczekiwan.",
  },
  {
    n: "4",
    title: "Wsparcie",
    desc: "Budowa sprzetu i rozwoj systemu ma zapewnic jego trwalosc i stabilnosc. Wsparcie dopasowane do potrzeb klienta poprzez dedykowane pakiety serwisowe.",
  },
];

const BG_COLOR = "#f5f7f9";
const STACK_OFFSET_PX = 56;
const TOP_OFFSET_VH = 26;
const INITIAL_GAP_VH_FRACTION = 0.13;

export default function RealizationsTabsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = itemRefs.current.filter(Boolean) as HTMLDivElement[];
      const shortViewport =
        typeof window !== "undefined" &&
        window.matchMedia("(max-height: 600px)").matches;

      // Landscape phone / very short laptop: the pinned 200%-scrub timeline
      // hides the bottom half of the section behind a viewport edge. Skip
      // the pin entirely, render every item at its resting state, and let
      // the page scroll naturally (CSS resets the absolute positioning at
      // the same breakpoint).
      if (shortViewport) {
        items.forEach((el) => gsap.set(el, { y: 0, opacity: 1 }));
        return;
      }

      const initialOffset = window.innerHeight * INITIAL_GAP_VH_FRACTION;

      // Initial: only the first item is visible. Items 1+ start fully
      // hidden (opacity 0) and slightly offset below their stacked position;
      // they fade in as they slide up.
      items.forEach((el, i) => {
        gsap.set(el, {
          y: i * initialOffset,
          opacity: i === 0 ? 1 : 0,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200%",
          pin: pinRef.current,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const STEP = 0.55;
      const DUR = 1.4;
      const itemsSpan = (ITEMS.length - 1) * STEP + DUR;

      // Image parallax — runs concurrently with the items reveal so both
      // animations progress together for the same scroll distance.
      tl.fromTo(
        imageRef.current,
        { y: 8 },
        { y: -8, duration: itemsSpan, ease: "none" },
        0,
      );

      // Each item slides up to its stacked position while opacity rises.
      // When it lands, its higher z-index covers the previous item's
      // description — same effect as the post-Hero QASection.
      items.forEach((el, i) => {
        if (i === 0) return;
        tl.to(
          el,
          { y: 0, opacity: 1, duration: DUR, ease: "power2.out" },
          i * STEP,
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ background: BG_COLOR }}>
      <div
        ref={pinRef}
        className="h-screen min-h-[640px] w-full overflow-hidden flex items-center px-[6vw] gap-12 max-lg:flex-col max-lg:gap-6 max-lg:items-stretch max-lg:py-[6vh] max-lg:justify-start [@media(max-height:600px)]:!h-auto [@media(max-height:600px)]:!min-h-0 [@media(max-height:600px)]:!overflow-visible [@media(max-height:600px)]:!py-[8vh]">
        {/* Left: image (smaller than viewport, gentle parallax drift) */}
        <div className="w-1/2 flex items-center justify-center max-lg:w-full max-lg:flex-none">
          <div className="w-full max-w-[500px] aspect-[5/7] overflow-hidden rounded-md max-lg:max-w-[220px] max-lg:aspect-[1800/2732] [@media(max-height:600px)]:!max-w-[180px] [@media(max-height:600px)]:!aspect-[16/9]">
            <img
              ref={imageRef}
              src="/retailo1.png"
              alt="Integracja, instalacja i wsparcie"
              className="w-full h-full object-cover will-change-transform max-lg:!object-contain"
              style={{ scale: 1.04 }}
            />
          </div>
        </div>

        {/* Right: header + stacked items */}
        <div className="w-1/2 h-full relative max-lg:w-full max-lg:flex-1 max-lg:min-h-[55vh] max-lg:[--rl-stack-top:14vh] [@media(max-height:600px)]:!flex [@media(max-height:600px)]:!flex-col [@media(max-height:600px)]:!gap-4 [@media(max-height:600px)]:!h-auto [@media(max-height:600px)]:!min-h-0">
          {/* Header — static, sits above the stacked items */}
          <div className="absolute top-[8vh] left-0 right-0 z-0 max-lg:top-0 max-lg:mb-4 [@media(max-height:600px)]:!static">
            <p
              className="m-0 mb-3 uppercase tracking-[0.2em] font-semibold text-[#0086b0]"
              style={{ fontSize: "clamp(0.72rem, 0.8vw, 0.85rem)" }}>
              Nasza oferta
            </p>
            <h2
              className="m-0 mb-4 font-bold text-[#0a2a2e]"
              style={{
                fontSize: "clamp(1.5rem, 2.3vw, 2.2rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}>
              Integracja, instalacja, wsparcie
            </h2>
            <p
              className="m-0 text-[#3a5a60] leading-relaxed"
              style={{
                fontSize: "clamp(0.88rem, 1vw, 0.98rem)",
                maxWidth: "440px",
              }}>
              Retailo. w ramach obslugi rozwiazania oferuje szereg uslug
              dodatkowych, niezbednych dla wspolpracy.
            </p>
          </div>

          {/* Stacked items — same QASection pattern */}
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="absolute left-0 right-0 will-change-transform [@media(max-height:600px)]:!static [@media(max-height:600px)]:!opacity-100 [@media(max-height:600px)]:!translate-y-0"
              style={{
                top: `calc(var(--rl-stack-top, ${TOP_OFFSET_VH}vh) + ${i * STACK_OFFSET_PX}px)`,
                zIndex: i + 1,
                background: BG_COLOR,
              }}>
              <div style={{ paddingBottom: "1.25rem" }}>
                <div
                  className="flex gap-3"
                  style={{
                    height: `${STACK_OFFSET_PX}px`,
                    alignItems: "center",
                  }}>
                  <span
                    className="font-bold text-[#0086b0]"
                    style={{ fontSize: "clamp(1rem, 1.4vw, 1.4rem)" }}>
                    {item.n} |
                  </span>
                  <h3
                    className="m-0 font-bold text-[#0a2a2e] uppercase tracking-wider"
                    style={{
                      fontSize: "clamp(0.95rem, 1.2vw, 1.15rem)",
                      lineHeight: 1.3,
                    }}>
                    {item.title}
                  </h3>
                </div>
                <p
                  className="m-0 text-[#3a5a60] leading-relaxed"
                  style={{
                    fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                    marginTop: "0.4rem",
                    maxWidth: "440px",
                  }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
