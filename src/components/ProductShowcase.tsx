"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const sketchRef = useRef<HTMLImageElement>(null);
  const featuresRef = useRef<HTMLOListElement>(null);
  const [mobilePhase2InView, setMobilePhase2InView] =
    useState<boolean>(false);

  // Mobile: swap phase-2 inline image (photo → draft) when phase-2 enters.
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

      const enterScale = isMobile ? 0.85 : 0.9;
      gsap.set(imageWrapRef.current, {
        xPercent: isMobile ? -50 : 0,
        yPercent: -50,
        scale: enterScale,
        x: 0,
        y: 0,
      });
      gsap.set(sketchRef.current, { opacity: 0 });

      // Phase 1 features list — staggered fade-in on enter, time-based.
      if (featuresRef.current && phase1Ref.current) {
        const items = featuresRef.current.children;
        gsap.set(items, { opacity: 0, x: -30 });

        let played = false;
        const play = () => {
          if (played) return;
          played = true;
          gsap.to(items, {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.18,
            ease: "power2.out",
            delay: 0.3,
          });
        };

        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                play();
                io.disconnect();
                break;
              }
            }
          },
          { threshold: 0.25 },
        );
        io.observe(phase1Ref.current);
      }

      // Phase-2 timeline: photo→sketch wipe, time-based. Reversible.
      const phase2Tl = gsap.timeline({ paused: true });
      phase2Tl
        .to(
          sketchRef.current,
          { opacity: 0.95, duration: 0.4, ease: "power1.out" },
          0,
        )
        .fromTo(
          photoRef.current,
          { webkitMaskSize: "100% 130%", maskSize: "100% 130%" },
          {
            webkitMaskSize: "100% 0%",
            maskSize: "100% 0%",
            duration: 0.9,
            ease: "power1.inOut",
          },
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
        className="relative w-full grid grid-cols-1"
        style={{
          background: "linear-gradient(180deg, #c0dbe2 0%, #e9e2d8 100%)",
        }}>
        {/* Sticky image layer — desktop only; mobile has inline images per phase. */}
        <div className="col-start-1 row-start-1 pointer-events-none z-[5] max-lg:hidden">
          <div className="sticky top-0 h-screen w-full">
            <div
              ref={imageWrapRef}
              className="absolute overflow-hidden will-change-transform right-[5vw] top-1/2 w-[600px] h-[700px] max-2xl:!right-[4vw] max-2xl:!w-[520px] max-2xl:!h-[610px] max-xl:!right-[3vw] max-xl:!w-[420px] max-xl:!h-[500px] max-lg:!right-auto max-lg:!left-1/2 max-lg:!top-1/2 max-lg:!w-[min(clamp(150px,30vh,340px),66vw)] max-lg:!h-[min(clamp(150px,30vh,340px),66vw)]">
              <img
                ref={photoRef}
                src="/pickupwall-photo.png"
                alt="PickUpWall"
                className="absolute z-[2] inset-0 w-full h-full object-contain"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
                  maskSize: "100% 130%",
                  maskRepeat: "no-repeat",
                  maskPosition: "0% 0%",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
                  WebkitMaskSize: "100% 130%",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "0% 0%",
                }}
              />
              <img
                ref={sketchRef}
                src="/pickupwall-sketch.png"
                alt="PickUpWall szkic"
                className="absolute inset-0 z-[1] w-full h-full object-contain opacity-0"
              />
            </div>
          </div>
        </div>

        {/* Content stack — two viewport-tall subsections. */}
        <div className="col-start-1 row-start-1 relative">
          {/* Phase 1 */}
          <div
            ref={phase1Ref}
            className="relative h-[65vh] min-h-[480px] max-lg:h-auto max-lg:min-h-0 max-lg:pt-[5dvh] max-lg:pb-[1dvh]">
            {/* Mobile-only inline image */}
            <div className="hidden max-lg:flex justify-center px-[6vw] mb-6">
              <img
                src="/pickupwall-photo.png"
                alt="PickUpWall"
                className="block w-[68vw] max-w-[320px] h-auto object-contain"
                style={{
                  filter:
                    "drop-shadow(0 14px 24px rgba(15,15,15,0.16)) drop-shadow(0 4px 10px rgba(15,15,15,0.08))",
                }}
              />
            </div>
            <div className="absolute inset-0 z-[3] pointer-events-none max-lg:relative max-lg:inset-auto">
              <div className="absolute top-[8vh] left-[5vw] max-w-[420px] max-lg:relative max-lg:top-auto max-lg:left-auto max-lg:px-[6vw] max-lg:mb-5 max-lg:max-w-none pointer-events-none">
                <p
                  className="text-[#2a2a2a]/80 font-light m-0 mb-2 leading-tight max-lg:text-[1.05rem] max-lg:mb-2"
                  style={{ fontSize: "clamp(1.2rem, 2vw, 1.8rem)" }}>
                  Nasze rozwiazanie
                  <br />
                  <span className="font-semibold" style={{ color: "#0086b0" }}>
                    PickUpWall
                  </span>
                </p>
              </div>
              <ol
                ref={featuresRef}
                className="absolute top-[24vh] left-[5vw] m-0 p-0 list-none flex flex-col gap-5 max-w-[440px] pointer-events-auto will-change-[transform,opacity] max-lg:relative max-lg:top-auto max-lg:bottom-auto max-lg:left-auto max-lg:px-[6vw] max-lg:max-w-none max-lg:gap-3">
                <li className="m-0 p-0">
                  <p
                    className="m-0 mb-4 uppercase tracking-[0.22em] font-bold max-lg:mb-3"
                    style={{
                      fontSize: "clamp(0.78rem, 0.9vw, 0.92rem)",
                      color: "#0086b0",
                    }}>
                    Wdrozenie krok po kroku
                  </p>
                </li>
                {[
                  [
                    "Integracja",
                    "Gwarantujemy elastycznosc w integracji — w sposobie komunikacji, jak i zakresie przesylanych danych.",
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
                ].map(([title, desc], i) => (
                  <li
                    key={title}
                    className="flex items-start gap-4 text-left will-change-[transform,opacity] max-lg:gap-3">
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

          {/* Phase 2 */}
          <div
            ref={phase2Ref}
            className="relative h-[80vh] min-h-[560px] max-lg:h-auto max-lg:min-h-0 max-lg:pt-[1dvh] max-lg:pb-[3dvh]">
            {/* Mobile-only inline image with photo → draft wavy mask wipe on enter */}
            <div className="hidden max-lg:flex justify-center px-[6vw] mb-6">
              <div className="relative w-[68vw] max-w-[320px] aspect-square">
                {/* Sketch (draft) sits beneath and reveals through the wipe */}
                <img
                  src="/pickupwall-sketch.png"
                  alt="PickUpWall szkic"
                  className="absolute inset-0 w-full h-full object-contain transition-opacity ease-out"
                  style={{
                    opacity: mobilePhase2InView ? 0.95 : 0,
                    transitionDuration: "600ms",
                    transitionDelay: mobilePhase2InView ? "300ms" : "0ms",
                  }}
                />
                {/* Photo on top — mask wipes from full to zero height */}
                <img
                  src="/pickupwall-photo.png"
                  alt="PickUpWall"
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{
                    maskImage:
                      "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "0% 0%",
                    WebkitMaskPosition: "0% 0%",
                    maskSize: mobilePhase2InView ? "100% 0%" : "100% 130%",
                    WebkitMaskSize: mobilePhase2InView
                      ? "100% 0%"
                      : "100% 130%",
                    transition:
                      "mask-size 1100ms cubic-bezier(0.65, 0, 0.35, 1), -webkit-mask-size 1100ms cubic-bezier(0.65, 0, 0.35, 1)",
                    transitionDelay: mobilePhase2InView ? "700ms" : "0ms",
                  }}
                />
              </div>
            </div>
            {/* Decorative background — "pickup." watermark + dot grid, bottom of section. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none overflow-hidden z-[0] max-lg:hidden">
              <p
                className="absolute m-0 font-black select-none"
                style={{
                  top: "-4vh",
                  left: "-2vw",
                  fontSize: "clamp(11rem, 20vw, 26rem)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.05em",
                  color: "rgba(15,15,15,0.05)",
                }}>
                pickup.
              </p>
              <svg
                className="absolute"
                style={{ bottom: "6vh", right: "5vw", opacity: 0.32 }}
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
                      fill="#0f0f0f"
                    />
                  )),
                )}
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-start pl-[6vw] pr-[4vw] py-[4vh] pointer-events-none z-[1] max-lg:relative max-lg:inset-auto max-lg:flex-col max-lg:justify-start max-lg:gap-4 max-lg:p-[0_6vw] max-lg:min-h-0">
              <div className="flex flex-col w-full max-w-[680px] pointer-events-auto max-2xl:max-w-[600px] max-xl:max-w-[520px] max-lg:max-w-full">
                <h2
                  className="uppercase tracking-widest m-0 mb-1"
                  style={{
                    fontSize: "clamp(0.85rem, 1.1vw, 1.1rem)",
                    color: "#0086b0",
                  }}>
                  retailo.
                </h2>
                <p
                  className="font-bold m-0 mb-7 leading-none tracking-tighter text-[#2a2a2a] max-lg:mb-5"
                  style={{ fontSize: "clamp(1.8rem, 3.2vw, 3.2rem)" }}>
                  Specyfikacja techniczna
                </p>

                {/* Component-level specs */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 max-lg:mb-6">
                  {[
                    ["Jednostka glowna", "39 skrytek + ekran"],
                    ["Jednostka rozszerzajaca", "40 skrytek"],
                    ["Ekran", '21.5" dotykowy'],
                    ["Integracja", "API / Middleware"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span
                        className="text-[0.68rem] font-medium uppercase tracking-widest"
                        style={{ color: "#0086b0" }}>
                        {label}
                      </span>
                      <span className="text-[#2a2a2a] text-[0.92rem] font-semibold">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Hardware Min/Max table */}
                <div
                  className="grid grid-cols-[1.5fr_1fr_1fr] items-end gap-x-6 pb-3 border-b"
                  style={{ borderColor: "rgba(15,42,46,0.18)" }}>
                  <span
                    className="font-bold tracking-tight"
                    style={{
                      color: "#0086b0",
                      fontSize: "clamp(1rem, 1.2vw, 1.2rem)",
                    }}>
                    Hardware
                  </span>
                  <span
                    className="text-right uppercase tracking-widest font-medium text-[#2a2a2a]/60"
                    style={{ fontSize: "0.68rem" }}>
                    Minimum
                  </span>
                  <span
                    className="text-right uppercase tracking-widest font-medium text-[#2a2a2a]/60"
                    style={{ fontSize: "0.68rem" }}>
                    Maximum
                  </span>
                </div>
                {[
                  ["Liczba skrytek", "39 szt", "159 szt"],
                  ["Szerokosc", "1 m", "4 m"],
                  ["Wysokosc", "2.2 m", "2.2 m"],
                  ["Glebokosc", "0.5 m", "0.5 m"],
                ].map(([label, min, max], i, arr) => (
                  <div
                    key={label}
                    className={`grid grid-cols-[1.5fr_1fr_1fr] items-center gap-x-6 py-3 ${
                      i < arr.length - 1 ? "border-b" : ""
                    }`}
                    style={{ borderColor: "rgba(15,42,46,0.08)" }}>
                    <span
                      className="font-semibold text-[#0a2a2e]"
                      style={{ fontSize: "clamp(0.92rem, 1.05vw, 1.05rem)" }}>
                      {label}
                    </span>
                    <span
                      className="text-right text-[#2a2a2a]/80 tabular-nums"
                      style={{ fontSize: "clamp(0.92rem, 1.05vw, 1.05rem)" }}>
                      {min}
                    </span>
                    <span
                      className="text-right text-[#2a2a2a]/80 tabular-nums"
                      style={{ fontSize: "clamp(0.92rem, 1.05vw, 1.05rem)" }}>
                      {max}
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
