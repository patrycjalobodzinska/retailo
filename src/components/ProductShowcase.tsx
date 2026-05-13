"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const bg1Ref = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const sketchRef = useRef<HTMLImageElement>(null);
  const bg2Ref = useRef<HTMLDivElement>(null);
  const textsPhase1Ref = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLUListElement>(null);
  const mobileBenefitsRef = useRef<HTMLDivElement>(null);
  const benefitItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Mobile-only solo step between Phase 2 exit and the stacking benefit
  // cards: the "Wersja pod klienta" card slides in, dwells, then slides
  // out before benefits start stacking.
  const mobileVersionCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Tablet + phone get the simpler "mobile" timeline so content is
      // never hidden behind the centered image on mid-sized screens.
      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 1023px)").matches;

      // Mobile rearranges the timeline so the features list (Modularnosc
      // etc.) only starts animating in AFTER the image has finished
      // arriving — and phase 2 (bg2 + retailo + specs) is pushed back to
      // give the features room to read.
      const POS = isMobile
        ? {
            featuresStart: 0.3,
            phase1FadeOut: 0.7,
            bg2In: 0.78,
            imageShrink: 0.9,
            sketch: 1.1,
          }
        : {
            featuresStart: 0.04,
            // Phase 1 (heading + Modularnosc / Skalowalnosc / … list) used
            // to fade out at 0.22 — only ~0.18 timeline units after the
            // features finished sliding in, which read as "text disappeared
            // before I could read it". Pushed back so the list has dwell
            // time before phase 2 wipes in.
            phase1FadeOut: 0.45,
            bg2In: 0.55,
            imageShrink: 0.65,
            sketch: 0.78,
          };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=500%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          // On resize, re-resolve "100vh"-style tween values so the image
          // entrance + phase-2 shrink stay sized to the new viewport.
          invalidateOnRefresh: true,
        },
      });

      gsap.set(imageWrapRef.current, { xPercent: -50, yPercent: -50 });

      // Desktop keeps the original 1.2x bump; mobile/tablet enters at a
      // smaller native scale because the wrapper itself is already sized
      // down via the max-lg:!w/h overrides.
      const enterScale = isMobile ? 1.05 : 1.2;

      tl.fromTo(
        imageWrapRef.current,
        { y: "100vh", scale: enterScale },
        { y: "0vh", scale: enterScale, duration: 0.25, ease: "none" },
        0,
      );

      // Feature list items — staggered fade-in. Position differs per
      // viewport: desktop overlaps with image entry, mobile waits until
      // image has stopped under the PickUpWall heading.
      if (featuresRef.current) {
        const items = featuresRef.current.children;
        gsap.set(items, { opacity: 0, x: -30 });
        tl.to(
          items,
          {
            opacity: 1,
            x: 0,
            duration: isMobile ? 0.05 : 0.035,
            stagger: isMobile ? 0.06 : 0.04,
            ease: "power2.out",
          },
          POS.featuresStart,
        );
      }

      // Phase 1 fade-out (header + features fade together before phase 2
      // slides in over them).
      // Slower fade (0.12 vs 0.05) so the eye registers the transition
      // rather than the heading + list snapping out.
      tl.to(
        textsPhase1Ref.current,
        { opacity: 0, duration: 0.12, ease: "power1.in" },
        POS.phase1FadeOut,
      );

      tl.fromTo(
        bg2Ref.current,
        { yPercent: -100 },
        { yPercent: 0, duration: 0.25, ease: "none" },
        POS.bg2In,
      );

      // Phase 2: image shrinks AND drifts to the upper-left so the spec
      // grid (bottom-left) and the "Korzysci wdrozenia" panel (right) get
      // their full reading area. Mobile timeline keeps it anchored where
      // it is — there's no second column to clear.
      // Phase 2 desktop: image shifts to the RIGHT of center so it stops
      // colliding with the left-side spec grid (PickUpWall + dane techniczne
      // + callout) — without this shift, on 1024–1500px viewports the
      // image was overlapping the spec column.
      tl.to(
        imageWrapRef.current,
        isMobile
          ? {
              // Mobile Phase 2: image is already smaller (34vh tall vs
              // 42vh) and lifted (top:35vh), so it just needs a gentle
              // shrink — not a dramatic one. Anything below ~0.8 makes
              // it feel disconnected from the heading.
              scale: 0.86,
              duration: 0.1,
              ease: "power1.inOut",
            }
          : {
              scale: 0.72,
              x: "3vw",
              duration: 0.12,
              ease: "power1.inOut",
            },
        POS.imageShrink,
      );

      tl.set(sketchRef.current, { opacity: 1 }, POS.sketch);
      tl.fromTo(
        photoRef.current,
        { webkitMaskSize: "100% 130%", maskSize: "100% 130%" },
        {
          webkitMaskSize: "100% 0%",
          maskSize: "100% 0%",
          duration: 0.15,
          ease: "none",
        },
        POS.sketch,
      );

      // Mobile: the top-down specs panel slides back up just before the
      // photo→sketch wipe begins. The wipe itself runs from 0.88 → 1.03,
      // so the benefit cards must wait for the whole photo to be gone and
      // the sketch fully revealed beneath it before they start animating
      // in. They begin at 1.18, well after the wipe completes.
      if (isMobile) {
        // bg2 exits AFTER the photo→sketch wipe by fading out — sliding it
        // upward dragged the PickUpWall heading + spec grid past the
        // still-visible image, which read as a clipping bug.
        tl.to(
          bg2Ref.current,
          { opacity: 0, duration: 0.12, ease: "power1.in" },
          1.15,
        );

        // Mobile solo step: "Wersja pod klienta" card slides in after
        // Phase 2 fades out, dwells, then slides out before the stacking
        // benefit cards begin.
        const versionCard = mobileVersionCardRef.current;
        if (versionCard) {
          gsap.set(versionCard, { y: 40, opacity: 0 });
          tl.to(
            versionCard,
            { y: 0, opacity: 1, duration: 0.14, ease: "power2.out" },
            1.3,
          );
          tl.to(
            versionCard,
            { y: -40, opacity: 0, duration: 0.12, ease: "power1.in" },
            1.7,
          );
        }

        const benefits = benefitItemRefs.current.filter(
          Boolean,
        ) as HTMLDivElement[];
        benefits.forEach((el, i) => {
          gsap.set(el, {
            y: i === 0 ? 30 : window.innerHeight * 0.45,
            opacity: 0,
          });
          tl.to(
            el,
            {
              y: 0,
              opacity: 1,
              duration: i === 0 ? 0.1 : 0.14,
              ease: "power2.out",
            },
            1.9 + i * 0.14,
          );
        });

        tl.to({}, { duration: 0.1 }, 2.55);
      } else {
        tl.to({}, { duration: 0.1 }, 0.7);
      }
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
        className="relative w-full h-screen min-h-[640px] overflow-hidden max-lg:h-[100dvh]">
        {/* Phase 1 bg - gradient scrolls */}
        <div
          ref={bg1Ref}
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(180deg, #c0dbe2 0%, #e9e2d8 100%)",
          }}
        />

        {/* Phase 1 texts */}
        <div
          ref={textsPhase1Ref}
          className="absolute inset-0 z-[3] pointer-events-none">
          <p
            className="absolute top-[15vh] left-[5vw] text-[#2a2a2a]/80 font-light m-0 leading-tight max-lg:top-[7vh] max-lg:left-[6vw] max-lg:right-[6vw] max-lg:text-[1.05rem]"
            style={{ fontSize: "clamp(1.2rem, 2vw, 1.8rem)" }}>
            Nasze rozwiazanie
            <br />
            <span className="font-semibold" style={{ color: "#0086b0" }}>
              PickUpWall
            </span>
          </p>
          <ul
            ref={featuresRef}
            className="absolute top-[15vh] right-[5vw] m-0 p-0 list-none flex flex-col gap-6 max-w-[360px] pointer-events-auto will-change-[transform,opacity] max-lg:!top-auto max-lg:!bottom-[calc(4dvh+env(safe-area-inset-bottom,0px))] max-lg:right-auto max-lg:left-[6vw] max-lg:max-w-[88vw] max-lg:gap-1.5">
            {[
              [
                "Modularnosc",
                "System sklada sie z jednostki glownej z ekranem oraz jednostek rozszerzajacych laczonych w jeden ciag — konfiguracje dobieramy do specyfiki punktu obslugi",
              ],
              [
                "Skalowalnosc",
                "Liczbe jednostek mozna rozbudowywac wraz ze wzrostem wolumenu zamowien, bez ingerencji w istniejaca instalacje",
              ],
              [
                "Personalizacja",
                "Dedykowane grafiki i kolor obudowy. Opcjonalny ekran Digital Signage",
              ],
              [
                "Uniwersalnosc",
                "Wymiary jednostek zgodne ze standardami zabudow meblowych w retailu",
              ],
            ].map(([title, desc]) => (
              <li
                key={title}
                className="flex flex-col gap-1.5 text-left will-change-[transform,opacity] max-lg:gap-0.5">
                <span
                  className="font-semibold uppercase tracking-widest max-lg:text-[0.74rem]"
                  style={{
                    color: "#0086b0",
                    fontSize: "clamp(0.9rem, 1.05vw, 1.05rem)",
                  }}>
                  {title}
                </span>
                <span
                  className="text-[#2a2a2a]/85 leading-snug max-lg:text-[0.78rem] max-lg:line-clamp-2"
                  style={{ fontSize: "clamp(1rem, 1.15vw, 1.15rem)" }}>
                  {desc}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Image wrapper — sits left of center under the PickUpWall heading
            column so the features on the right never get covered. xPercent
            / yPercent of -50 are applied in JS, so left/top define the
            image's CENTER. */}
        <div
          ref={imageWrapRef}
          className="absolute z-[5] overflow-hidden will-change-transform left-1/2 top-1/2 w-[500px] h-[590px] max-2xl:!left-[44%] max-2xl:!w-[440px] max-2xl:!h-[520px] max-xl:!left-[40%] max-xl:!w-[360px] max-xl:!h-[430px] max-lg:!left-1/2 max-lg:!top-[31vh] max-lg:!w-[min(clamp(150px,30vh,340px),66vw)] max-lg:!h-[min(clamp(150px,30vh,340px),66vw)]">
          <img
            ref={photoRef}
            src="/model1.png"
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
            src="/draft4.png"
            alt="PickUpWall szkic"
            className="absolute inset-0 z-[1] w-full h-full object-contain opacity-0"
          />
        </div>

        {/* Phase 2 - jednolity docelowy kolor + content */}
        <div
          ref={bg2Ref}
          className="absolute inset-0 z-[1] overflow-hidden will-change-transform"
          style={{ background: "transparent" }}>
          <div className="absolute inset-0 flex justify-between p-[8vh_5vw] pointer-events-none max-lg:flex-col max-lg:justify-end max-lg:gap-6 max-lg:p-[5vh_6vw]">
            {/* Left */}
            <div className="flex flex-col justify-end max-w-[360px] pointer-events-auto max-lg:max-w-full">
              <h2
                className="uppercase tracking-widest m-0 mb-1"
                style={{
                  fontSize: "clamp(0.85rem, 1.1vw, 1.1rem)",
                  color: "#0086b0",
                }}>
                retailo.
              </h2>
              <p
                className="font-bold m-0 mb-8 leading-none tracking-tighter text-[#2a2a2a] max-lg:mb-6"
                style={{ fontSize: "clamp(1.8rem, 3.4vw, 3.6rem)" }}>
                PickUpWall
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {[
                  ["Jednostka glowna", "39 skrytek + ekran"],
                  ["Jednostka rozszerzajaca", "40 skrytek"],
                  ["Wymiary jednostki", "197 × 102.5 × 5 cm"],
                  ["Standardowa konfiguracja", "2 jednostki, 79 skrytek"],
                  ["Ekran", '21.5" dotykowy'],
                  ["Integracja", "API / Middleware"],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span
                      className="text-[0.7rem] font-medium uppercase tracking-widest"
                      style={{ color: "#0086b0" }}>
                      {label}
                    </span>
                    <span className="text-[#2a2a2a] text-[0.9rem] font-semibold">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Right — kompaktowa lista korzysci wdrozenia + prominent
                card "Wersja pod klienta". Pokazywane rowniez na mobile,
                gdzie ukladaja sie w stosie pod spec gridem. */}
            <div className="flex flex-col justify-center max-w-[460px] pt-[4vh] gap-6 pointer-events-auto max-2xl:max-w-[360px] max-xl:max-w-[320px] max-lg:max-w-full max-lg:pt-0">
              {/* Korzysci wdrozenia — desktop only. Mobile already shows
                  the same benefits in the stacking cards further down. */}
              <div className="max-lg:hidden">
                <p
                  className="m-0 mb-3 uppercase tracking-[0.22em] font-bold"
                  style={{ fontSize: "0.72rem", color: "#0086b0" }}>
                  Korzysci wdrozenia
                </p>
                <ul className="m-0 p-0 list-none grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {[
                    "Eliminacja posrednictwa sluzb sprzedazy",
                    "Skrocenie kolejek przy odbiorze",
                    "Bezdotykowa, bezpieczna obsluga",
                    "Zwolnienie przestrzeni magazynowej",
                  ].map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-[#2a2a2a] leading-snug"
                      style={{ fontSize: "0.86rem" }}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0086b0"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0, marginTop: 3 }}
                        aria-hidden="true">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Desktop only — on mobile this card gets its own
                  standalone animation step (mobileVersionCardRef below). */}
              <div
                className="rounded-2xl p-8 max-lg:hidden"
                style={{
                  background: "rgba(0,134,176,0.06)",
                  border: "1px solid rgba(0,134,176,0.18)",
                  boxShadow: "0 12px 32px rgba(10,30,38,0.06)",
                }}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="block"
                    style={{ width: 36, height: 2, background: "#0086b0" }}
                  />
                  <p
                    className="m-0 uppercase tracking-[0.22em] font-bold"
                    style={{ fontSize: "0.72rem", color: "#0086b0" }}>
                    Wersja pod klienta
                  </p>
                </div>
                <h3
                  className="m-0 mb-4 font-bold tracking-tight text-[#0a2a2e]"
                  style={{
                    fontSize: "clamp(1.4rem, 2.4vw, 2.4rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}>
                  Dostosowujemy format urzadzen pod klienta.
                </h3>
                <p
                  className="m-0 text-[#3a5a60] leading-relaxed"
                  style={{ fontSize: "clamp(0.95rem, 1.15vw, 1.1rem)" }}>
                  Przy szerszej wspolpracy dobieramy wymiary, liczbe i
                  konfiguracje skrytek, obudowe oraz grafike pod konkretne
                  wymagania marki i przestrzeni.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only solo "Wersja pod klienta" card — slides in after
            Phase 2 exits, then slides out before the stacking benefit
            cards arrive. */}
        <div
          ref={mobileVersionCardRef}
          className="lg:hidden absolute left-[6vw] right-[6vw] bottom-[calc(6dvh+env(safe-area-inset-bottom,0px))] z-[9] pointer-events-auto opacity-0">
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(0,134,176,0.08)",
              border: "1px solid rgba(0,134,176,0.22)",
              boxShadow: "0 18px 44px rgba(10,30,38,0.12)",
              backdropFilter: "blur(8px)",
            }}>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="block"
                style={{ width: 30, height: 2, background: "#0086b0" }}
              />
              <p
                className="m-0 uppercase tracking-[0.22em] font-bold"
                style={{ fontSize: "0.68rem", color: "#0086b0" }}>
                Wersja pod klienta
              </p>
            </div>
            <h3
              className="m-0 mb-3 font-bold tracking-tight text-[#0a2a2e]"
              style={{
                fontSize: "clamp(1.4rem, 6vw, 1.9rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}>
              Dostosowujemy format urzadzen pod klienta.
            </h3>
            <p
              className="m-0 text-[#3a5a60] leading-relaxed"
              style={{ fontSize: "0.92rem" }}>
              Przy szerszej wspolpracy dobieramy wymiary, liczbe i
              konfiguracje skrytek, obudowe oraz grafike pod konkretne
              wymagania marki i przestrzeni.
            </p>
          </div>
        </div>

        {/* Mobile-only stacking benefits — appear after the photo→sketch
            wipe. Each card stacks on top of the previous, covering its
            description, until all four titles sit in a tight column. */}
        <div
          ref={mobileBenefitsRef}
          className="lg:hidden absolute inset-0 z-[8] pointer-events-none">
          {[
            [
              "Eliminacja",
              "Wyeliminowanie nieproduktywnego wykorzystania sluzb sprzedazy klienta poprzez wylaczenie ich posrednictwa w procesie odbioru paczki.",
            ],
            [
              "Wydatne skrocenie",
              "Wydatne skrocenie kolejek dzieki maksymalnemu skroceniu czasu odbioru.",
            ],
            [
              "Zwiekszenie bezpieczenstwa",
              "Zwiekszenie bezpieczenstwa klienta i sluzb sprzedazy, zwlaszcza w sytuacji zagrozenia epidemiologicznego.",
            ],
            [
              "Zwolnienie przestrzeni",
              "Zwolnienie przestrzeni magazynowej na zapleczu punktu sprzedazy.",
            ],
          ].map(([title, desc], i) => (
            <div
              key={title}
              ref={(el) => {
                benefitItemRefs.current[i] = el;
              }}
              className="absolute left-[6vw] right-[6vw] pointer-events-auto rounded-md will-change-[transform,opacity]"
              style={{
                // Bottom-anchored stack. minHeight set tight against
                // the longest card's content (~132px for the Eliminacja
                // description). dvh (dynamic viewport height) instead of
                // vh so the cards reposition when iOS Safari's URL bar
                // expands on scroll-up — vh refers to the large viewport
                // (no toolbar) and would otherwise push the cards under
                // the bar. env(safe-area-inset-bottom) adds the
                // home-indicator height on devices that have one.
                bottom: `calc(8dvh + ${(3 - i) * 48}px + env(safe-area-inset-bottom, 0px))`,
                minHeight: 134,
                zIndex: 10 + i,
                background: "#e9e2d8",
                boxShadow: "0 -4px 14px rgba(10, 30, 38, 0.06)",
                opacity: 0,
              }}>
              <div
                className="px-4 flex items-center"
                style={{ height: 48 }}>
                <h3
                  className="m-0 font-bold uppercase tracking-wider"
                  style={{
                    fontSize: "0.85rem",
                    color: "#0086b0",
                    lineHeight: 1.2,
                  }}>
                  {`${String(i + 1).padStart(2, "0")} ${title}`}
                </h3>
              </div>
              <p
                className="m-0 px-4 pb-4 text-[#2a2a2a]/85 leading-snug"
                style={{ fontSize: "0.78rem" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
