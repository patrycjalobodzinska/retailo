"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { LocalizedField } from "@/lib/sanity/i18n";
import {
  REALIZATIONS as ALL_REALIZATIONS,
  type Realization,
} from "@/lib/realizations";

// Carousel intentionally limited to the first 4 realizations for now.
// The /realizacje list and detail pages still see the full set.
const REALIZATIONS = ALL_REALIZATIONS.slice(0, 4);
import TextRotate, { type TextRotateRef } from "@/components/TextRotate";

type RealizationsData = {
  realizationsEyebrow?: LocalizedField;
  realizationsHeadline?: LocalizedField;
  realizationsIntro?: LocalizedField;
  realizationsCtaLabel?: LocalizedField;
  realizationsCtaHref?: string;
  realizationsSystemEyebrow?: LocalizedField;
  realizationsSystemHeadline?: LocalizedField;
  realizationsSystemItems?: Array<{
    title?: LocalizedField;
    description?: LocalizedField;
  }>;
} | null;

gsap.registerPlugin(CustomEase, ScrollTrigger);


const POSITIONS = {
  // prev/next sit higher than the active slide so the side thumbnails
  // align with the upper portion of the centerpiece — visually they read
  // as "above the fold" rather than "shrunken & dropped down".
  prev: { left: "15%", top: "40%", rotation: 0, width: "22vw", height: "26vh" },
  active: { left: "50%", top: "50%", rotation: 0, width: "30vw", height: "65vh" },
  next: { left: "85%", top: "40%", rotation: 0, width: "22vw", height: "26vh" },
} as const;

const CLIP = {
  closed: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
};

const TOTAL = REALIZATIONS.length;
const mod = (n: number, m: number) => ((n % m) + m) % m;
const SLIDE_DURATION = 1.6;

const SLIDE_BASE =
  "slide-container absolute top-1/2 cursor-pointer z-[2] max-lg:top-[40%]";

function buildSlideHTML(content: Realization) {
  // Slide is now just the image. Title / location / CTA live in a single
  // fixed-position caption block in the section JSX, animated on slide
  // transition rather than re-built per slide.
  return `
    <div class="slide-img absolute inset-0 overflow-hidden" style="will-change:transform;border-radius:inherit">
      <img src="${content.image}" alt="${content.title}" class="w-full h-full object-cover" style="opacity:0.85;will-change:transform" />
    </div>`;
}

export default function RealizationsSection({
  data,
}: { data?: RealizationsData } = {}) {
  const { t } = useLang();
  const sEyebrow = t(data?.realizationsEyebrow ?? null) || "Realizacje";
  const sHeadline = t(data?.realizationsHeadline ?? null) || "PickUpWall w akcji.";
  const sIntro =
    t(data?.realizationsIntro ?? null) ||
    "Wybrane wdrozenia PickUpWall w punktach sprzedazy, galeriach i biurowcach w Polsce i za granica.";
  const sCtaLabel =
    t(data?.realizationsCtaLabel ?? null) || "Zobacz wszystkie realizacje";
  const sCtaHref = data?.realizationsCtaHref || "/realizacje";
  const sysEyebrow =
    t(data?.realizationsSystemEyebrow ?? null) || "System obslugi zamowien";
  const sysHeadline =
    t(data?.realizationsSystemHeadline ?? null) || "PickUpWall";
  const sysItems =
    data?.realizationsSystemItems && data.realizationsSystemItems.length > 0
      ? data.realizationsSystemItems.map((item) => ({
          title: t(item?.title ?? null),
          desc: t(item?.description ?? null),
        }))
      : [
          {
            title: "PickUpWall",
            desc: "Efektowna, modularna szafa ze skrytkami do automatycznego odbioru zamowien klientow ecommerce.",
          },
          {
            title: "Latwosc obslugi",
            desc: "Czytelny ekran LCD, czytnik kodow QR umozliwiajace latwy i bezdotykowy odbior paczki.",
          },
          {
            title: "Zamowienia 360",
            desc: "System z pelnym procesem obslugi zamowienia od otrzymania szczegolow, przez obsluge umieszczenia paczki, po komunikacje do klienta.",
          },
        ];
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const mobileScrollerRef = useRef<HTMLDivElement>(null);
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0);
  const pinChildRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const bgWrapperRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  // Caption text is driven by TextRotate refs. Each line owns its own
  // per-character enter/exit animation; the carousel just calls jumpTo()
  // on every slide change.
  const captionLocRef = useRef<TextRotateRef>(null);
  const captionTitleRef = useRef<TextRotateRef>(null);
  const captionCtaRef = useRef<HTMLAnchorElement>(null);

  const activeIdxRef = useRef(0);
  const isAnimating = useRef(false);
  const revealProgress = useRef(0);
  const isFlyingRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  // Any pending clone is removed on path change (covers back-navigation
  // where a stale clone would otherwise sit on top of /) and on unmount.
  useEffect(() => {
    const stale = document.querySelectorAll(
      "[data-realization-fly-clone]",
    );
    stale.forEach((el) => el.remove());
    isFlyingRef.current = false;
  }, [pathname]);
  useEffect(() => {
    return () => {
      document
        .querySelectorAll("[data-realization-fly-clone]")
        .forEach((el) => el.remove());
    };
  }, []);

  // Navigation transition:
  //   1. Spawn a light-gradient panel pinned to the active slide's rect.
  //   2. GSAP-tween it out to fill the screen, covering everything.
  //   3. Push the route — destination renders behind the still-opaque
  //      panel, so the user sees no carousel/destination flash.
  //   4. After a short hold for the new page to paint, fade the panel
  //      out — the destination's hero image becomes visible naturally
  //      (no double-render of the same image source).
  const flyToDetail = useCallback(
    (slug: string) => {
      if (isFlyingRef.current) return;
      const slider = sliderRef.current;
      const sourceSlide = slider?.querySelector<HTMLElement>(
        ".slide-container.active",
      );
      if (!sourceSlide) {
        router.push(`/realizacje/${slug}`);
        return;
      }
      isFlyingRef.current = true;

      const rect = sourceSlide.getBoundingClientRect();

      const panel = document.createElement("div");
      panel.setAttribute("data-realization-fly-clone", "1");
      Object.assign(panel.style, {
        position: "fixed",
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: "0",
        zIndex: "9999",
        pointerEvents: "none",
        overflow: "hidden",
        borderRadius: getComputedStyle(sourceSlide).borderRadius || "0",
        // Light gradient matching the bright product-showcase phase
        // (#c0dbe2 → #e9e2d8). Stays as the cover layer over the
        // carousel AND over the destination hero during the fade.
        background:
          "linear-gradient(180deg, #c0dbe2 0%, #e9e2d8 100%)",
        willChange: "top,left,width,height,border-radius,opacity",
        opacity: "1",
      });
      document.body.appendChild(panel);

      // Pre-warm the destination route so router.push has the JS chunk
      // ready by the time the expand animation completes. Without this,
      // a first-visit navigation can take 300-800ms after push before
      // the new page paints — and during that gap a fixed-duration hold
      // pulls the panel off too early, briefly revealing the homepage.
      router.prefetch(`/realizacje/${slug}`);

      const tl = gsap.timeline();
      tl.to(panel, {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        duration: 0.55,
        ease: "power3.inOut",
      });
      tl.add(() => {
        router.push(`/realizacje/${slug}`);
      });
      // DO NOT auto-remove the panel after a fixed delay — on first
      // navigation that fires before the destination has rendered and
      // the homepage flashes through. The pathname-change useEffect
      // above removes any stale panels once Next has actually swapped
      // the route. A safety timeout below clears the panel if pathname
      // change somehow doesn't fire within 4s (aborted nav, etc.).
      window.setTimeout(() => {
        if (document.body.contains(panel)) {
          panel.remove();
          isFlyingRef.current = false;
        }
      }, 4000);
    },
    [router],
  );

  const updateCounterAndItems = useCallback((idx: number) => {
    if (itemsRef.current) {
      itemsRef.current.querySelectorAll<HTMLElement>("[data-idx]").forEach((el) => {
        const i = Number(el.dataset.idx);
        if (i === idx) {
          el.classList.add("text-white");
          el.classList.remove("text-[#5e5e5e]");
        } else {
          el.classList.remove("text-white");
          el.classList.add("text-[#5e5e5e]");
        }
      });
    }
  }, []);

  const swapCaption = useCallback((idx: number) => {
    const r = REALIZATIONS[idx];
    const cta = captionCtaRef.current;
    if (cta) cta.href = `/realizacje/${r.slug}`;
    captionLocRef.current?.jumpTo(idx);
    captionTitleRef.current?.jumpTo(idx);
  }, []);

  const updateBg = useCallback((idx: number) => {
    const wrapper = bgWrapperRef.current;
    if (!wrapper) return;
    const newImg = document.createElement("img");
    newImg.src = REALIZATIONS[idx].image;
    newImg.alt = "";
    newImg.className = "absolute inset-0 w-full h-full object-cover object-center";
    newImg.style.opacity = "0";
    wrapper.appendChild(newImg);
    gsap.to(newImg, {
      opacity: 1,
      duration: 1,
      ease: "power2.inOut",
      delay: 0.4,
      onComplete: () => {
        const stale = wrapper.querySelectorAll("img");
        stale.forEach((el, i) => {
          if (i < stale.length - 1) el.remove();
        });
      },
    });
  }, []);

  // initial GSAP positioning + imperatively populate slider with 3 slides
  useEffect(() => {
    CustomEase.create(
      "hop",
      "M0,0 C0.488,0.02 0.467,0.286 0.5,0.5 0.532,0.712 0.58,1 1,1",
    );

    const slider = sliderRef.current;
    if (!slider) return;

    // Create the three initial slides (prev/active/next) and append them.
    // React isn't tracking these, so transition()'s later appendChild /
    // remove() calls won't conflict with React's reconciliation.
    const initialPrevIdx = mod(0 - 1, TOTAL);
    const initialNextIdx = mod(0 + 1, TOTAL);
    const roleToContent: Array<["prev" | "active" | "next", number]> = [
      ["prev", initialPrevIdx],
      ["active", 0],
      ["next", initialNextIdx],
    ];
    roleToContent.forEach(([role, idx]) => {
      const el = document.createElement("div");
      el.className = `${SLIDE_BASE} ${role}`;
      el.style.willChange = "transform, opacity, clip-path";
      el.innerHTML = buildSlideHTML(REALIZATIONS[idx]);
      slider.appendChild(el);
    });

    (Object.entries(POSITIONS) as [keyof typeof POSITIONS, (typeof POSITIONS)[keyof typeof POSITIONS]][]).forEach(
      ([key, value]) => {
        const slide = slider.querySelector<HTMLElement>(`.slide-container.${key}`);
        if (!slide) return;
        gsap.set(slide, {
          left: value.left,
          top: value.top,
          rotation: value.rotation,
          width: value.width,
          height: value.height,
          xPercent: -50,
          yPercent: -50,
        });
      },
    );

    return () => {
      // Clean up all slides we appended (React doesn't know about them).
      while (slider.firstChild) slider.removeChild(slider.firstChild);
    };
  }, []);

  const transition = useCallback(
    (direction: "next" | "prev") => {
      if (isAnimating.current) return;
      const slider = sliderRef.current;
      if (!slider) return;
      isAnimating.current = true;

      // Mobile: side slides are CSS-hidden (width/height/opacity 0
      // !important) so the desktop multi-slide morph does nothing
      // visually. Instead, run a simple crossfade on the active slide.
      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 1023px)").matches;
      if (isMobile) {
        const active = slider.querySelector<HTMLElement>(
          ".slide-container.active",
        );
        if (!active) {
          isAnimating.current = false;
          return;
        }
        const newActiveIdx = mod(
          activeIdxRef.current + (direction === "next" ? 1 : -1),
          TOTAL,
        );
        const newContent = REALIZATIONS[newActiveIdx];
        const fade = gsap.timeline({
          onComplete: () => {
            isAnimating.current = false;
          },
        });
        fade.to(active, { opacity: 0, duration: 0.25, ease: "power2.in" });
        fade.add(() => {
          active.innerHTML = buildSlideHTML(newContent);
          activeIdxRef.current = newActiveIdx;
          updateCounterAndItems(newActiveIdx);
          updateBg(newActiveIdx);
          swapCaption(newActiveIdx);
        });
        fade.to(active, { opacity: 1, duration: 0.3, ease: "power2.out" });
        return;
      }

      const [outgoingPos, incomingPos] =
        direction === "next" ? (["prev", "next"] as const) : (["next", "prev"] as const);

      const outgoing = slider.querySelector<HTMLElement>(`.slide-container.${outgoingPos}`);
      const active = slider.querySelector<HTMLElement>(".slide-container.active");
      const incoming = slider.querySelector<HTMLElement>(`.slide-container.${incomingPos}`);

      if (!outgoing || !active || !incoming) {
        isAnimating.current = false;
        return;
      }

      const animSlide = (
        el: HTMLElement,
        props: {
          left: string;
          top: string;
          rotation: number;
          width: string;
          height: string;
        },
      ) => {
        gsap.to(el, { ...props, duration: SLIDE_DURATION, ease: "hop" });
      };

      animSlide(incoming, { ...POSITIONS.active });
      animSlide(active, { ...POSITIONS[outgoingPos] });
      gsap.to(outgoing, { scale: 0, opacity: 0, duration: SLIDE_DURATION, ease: "hop" });

      const newSlideIdx = mod(
        activeIdxRef.current + (direction === "next" ? 2 : -2),
        TOTAL,
      );
      const newContent = REALIZATIONS[newSlideIdx];
      const newSlide = document.createElement("div");
      newSlide.className = `${SLIDE_BASE} ${incomingPos}`;
      newSlide.style.willChange = "transform, opacity, clip-path";
      newSlide.innerHTML = buildSlideHTML(newContent);
      slider.appendChild(newSlide);

      gsap.set(newSlide, {
        ...POSITIONS[incomingPos],
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 0,
      });
      gsap.to(newSlide, { scale: 1, opacity: 1, duration: SLIDE_DURATION, ease: "hop" });

      const newActiveIdx = mod(
        activeIdxRef.current + (direction === "next" ? 1 : -1),
        TOTAL,
      );

      updateBg(newActiveIdx);
      swapCaption(newActiveIdx);

      window.setTimeout(() => updateCounterAndItems(newActiveIdx), 800);

      window.setTimeout(() => {
        outgoing.remove();
        active.className = `${SLIDE_BASE} ${outgoingPos}`;
        active.style.willChange = "transform, opacity, clip-path";
        incoming.className = `${SLIDE_BASE} active`;
        incoming.style.willChange = "transform, opacity, clip-path";
        activeIdxRef.current = newActiveIdx;
        isAnimating.current = false;
      }, SLIDE_DURATION * 1000);
    },
    [updateBg, updateCounterAndItems, swapCaption],
  );

  // Mobile: track which carousel card is most-visible for the pagination
  // dots. IntersectionObserver against the scroller as root, same pattern
  // as QASection mobile.
  useEffect(() => {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const scroller = mobileScrollerRef.current;
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
        setMobileActiveIdx(bestIdx);
      },
      { root: scroller, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  // pin + reveal-progress rAF loop (desktop only — the custom pin is
  // useless on phones where the entire carousel is replaced).
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      return;
    }

    const wrap = pinWrapperRef.current;
    const child = pinChildRef.current;
    const slider = sliderRef.current;
    if (!wrap || !child || !slider) return;

    let rafId = 0;
    let smoothed = 0;
    let lastWrittenProgress = -1;
    let lastWrittenExitP = -1;
    let lastMode: "before" | "pinned" | "after" | null = null;
    const LERP = 0.16;
    const PROGRESS_EPS = 0.003;
    const TRANSLATE_EPS = 0.0008;

    // Cache wrap geometry. Reading getBoundingClientRect every frame would
    // force sync layout when GSAP is mutating slide widths/heights during a
    // click transition. We refresh on resize and — crucially — on
    // ScrollTrigger.refresh, because other sections (QASection) use
    // ScrollTrigger pins whose pin-spacers shift this wrapper's offsetTop
    // after our initial mount.
    let wrapTop = 0;
    let wrapHeight = 0;
    let viewportHeight = window.innerHeight;
    const recomputeGeometry = () => {
      wrapTop = wrap.offsetTop;
      wrapHeight = wrap.offsetHeight;
      viewportHeight = window.innerHeight;
    };
    recomputeGeometry();
    window.addEventListener("resize", recomputeGeometry);
    ScrollTrigger.addEventListener("refresh", recomputeGeometry);
    // Also recompute on the next animation frame, in case other ScrollTriggers
    // mount after us and inject pin spacers without firing refresh yet.
    const initialRecomputeId = requestAnimationFrame(recomputeGeometry);

    // Cache the role-tagged slides so we don't pay a querySelector on every
    // tick. The transition swaps the `.prev/.active/.next` classes around
    // 1.6s after a click — a MutationObserver re-caches them then.
    let cachedPrev: HTMLElement | null = null;
    let cachedActive: HTMLElement | null = null;
    let cachedNext: HTMLElement | null = null;
    const refreshSlides = () => {
      cachedPrev = slider.querySelector<HTMLElement>(".slide-container.prev");
      cachedActive = slider.querySelector<HTMLElement>(".slide-container.active");
      cachedNext = slider.querySelector<HTMLElement>(".slide-container.next");
    };
    refreshSlides();
    const observer = new MutationObserver(refreshSlides);
    observer.observe(slider, {
      childList: true,
      subtree: false,
      attributes: true,
      attributeFilter: ["class"],
    });

    const tick = () => {
      const rectTop = wrapTop - window.scrollY;
      const total = wrapHeight - viewportHeight;
      const holdAmount = viewportHeight * 0.45;
      const scrolled = Math.max(0, -rectTop);

      let target = 0;
      let mode: "before" | "pinned" | "after";
      if (rectTop > 0 || total <= 0) {
        mode = "before";
        target = 0;
      } else if (scrolled >= total) {
        mode = "after";
        target = 1;
      } else {
        mode = "pinned";
        const revealRange = Math.max(1, total - holdAmount);
        target = Math.max(0, Math.min(1, (scrolled - holdAmount) / revealRange));
      }

      if (mode !== lastMode) {
        if (mode === "before") {
          child.style.position = "absolute";
          child.style.top = "0";
          child.style.bottom = "auto";
        } else if (mode === "pinned") {
          child.style.position = "fixed";
          child.style.top = "0";
          child.style.bottom = "auto";
        } else {
          child.style.position = "absolute";
          child.style.top = "auto";
          child.style.bottom = "0";
        }
        lastMode = mode;
      }

      smoothed += (target - smoothed) * LERP;
      if (Math.abs(smoothed - target) < 0.0005) smoothed = target;

      // Slide translates are GPU-cheap — write them on essentially every
      // frame so the slide-return-to-place animation stays smooth even at
      // small per-frame deltas. Only the heavier CSS-variable / parallax
      // writes are coarsely throttled.
      if (Math.abs(smoothed - lastWrittenExitP) > TRANSLATE_EPS) {
        const exitP = Math.min(1, Math.max(0, smoothed * 1.8));
        if (cachedPrev) {
          cachedPrev.style.translate = `${(-90 * exitP).toFixed(2)}vw ${(-110 * exitP).toFixed(2)}vh`;
        }
        if (cachedNext) {
          cachedNext.style.translate = `${(90 * exitP).toFixed(2)}vw ${(-110 * exitP).toFixed(2)}vh`;
        }
        if (cachedActive) {
          cachedActive.style.translate = `0 ${(-130 * exitP).toFixed(2)}vh`;
        }
        lastWrittenExitP = smoothed;
      }

      if (Math.abs(smoothed - lastWrittenProgress) > PROGRESS_EPS) {
        revealProgress.current = smoothed;
        child.style.setProperty("--reveal-progress", smoothed.toFixed(3));

        const bgY = -smoothed * viewportHeight * 0.4;
        child.style.setProperty("--bg-scroll-y", `${bgY.toFixed(1)}px`);

        lastWrittenProgress = smoothed;
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(initialRecomputeId);
      observer.disconnect();
      window.removeEventListener("resize", recomputeGeometry);
      ScrollTrigger.removeEventListener("refresh", recomputeGeometry);
    };
  }, []);

  const onSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const slide = (e.target as HTMLElement).closest<HTMLElement>(".slide-container");
    if (!slide || isAnimating.current) return;
    if (slide.classList.contains("active")) {
      e.preventDefault();
      flyToDetail(REALIZATIONS[activeIdxRef.current].slug);
    } else if (slide.classList.contains("next")) transition("next");
    else if (slide.classList.contains("prev")) transition("prev");
  };

  const onItemClick = (idx: number) => {
    if (isAnimating.current) return;
    if (idx === activeIdxRef.current) return;
    transition(idx > activeIdxRef.current ? "next" : "prev");
  };

  const initialActive = 0;

  const scrollMobileTo = (i: number) => {
    const scroller = mobileScrollerRef.current;
    if (!scroller) return;
    const card = scroller.children[i] as HTMLElement | undefined;
    if (!card) return;
    scroller.scrollTo({ left: card.offsetLeft - 24, behavior: "smooth" });
  };

  return (
    <>
      {/* MOBILE — swipe-snap card stack + system obsługi text below */}
      <div className="lg:hidden bg-[#0f0f0f] text-white py-[10vh]">
        <div className="px-[6vw] mb-7">
          <p
            className="m-0 mb-3 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
            style={{ fontSize: "0.72rem" }}>
            Realizacje
          </p>
          <h2
            className="m-0 font-bold tracking-tight"
            style={{
              fontSize: "clamp(1.9rem, 8vw, 2.6rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}>
            PickUpWall w akcji.
          </h2>
          <p
            className="m-0 mt-4 text-white/70 leading-relaxed"
            style={{ fontSize: "0.9rem", maxWidth: "440px" }}>
            Wybrane wdrozenia PickUpWall w punktach sprzedazy, galeriach i
            biurowcach w Polsce i za granica.
          </p>
        </div>

        <div
          ref={mobileScrollerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-[6vw] no-scrollbar"
          style={{ scrollPadding: "0 6vw" }}>
          {REALIZATIONS.map((r, i) => {
            const slug = r.slug;
            return (
              <div
                key={`${r.title}-${i}`}
                className="flex-none snap-center relative rounded-2xl overflow-hidden bg-black"
                style={{
                  // Cap the card to 78% of viewport height so on landscape
                  // phones (and short laptops) the whole image is visible
                  // without scrolling. Width follows from aspect ratio so
                  // the 4:5 portrait look is preserved.
                  aspectRatio: "4 / 5",
                  height: "min(78vh, calc(84vw * 5 / 4))",
                }}>
                <img
                  src={r.image}
                  alt={r.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: 0.85 }}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 55%)",
                  }}
                />
                <p
                  className="absolute top-5 left-5 m-0 uppercase tracking-widest font-semibold text-[#7ed5e6]"
                  style={{ fontSize: "0.72rem" }}>
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(REALIZATIONS.length).padStart(2, "0")}
                </p>
                <div className="absolute left-5 right-5 bottom-5 z-[3]">
                  <p
                    className="m-0 mb-1.5 uppercase tracking-[0.2em] font-semibold text-[#7ed5e6]"
                    style={{ fontSize: "0.66rem" }}>
                    {r.location}
                  </p>
                  <h3
                    className="m-0 mb-3 font-bold text-white"
                    style={{
                      fontSize: "1.1rem",
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                    }}>
                    {r.title}
                  </h3>
                  <Link
                    href={`/realizacje/${slug}`}
                    className="inline-flex items-center gap-1.5 text-white no-underline"
                    style={{
                      fontSize: "0.66rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      borderBottom: "1px solid rgba(255,255,255,0.4)",
                      paddingBottom: 2,
                    }}>
                    Zobacz realizacje
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-2 mt-5 px-[6vw]">
          {REALIZATIONS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Karta ${i + 1}`}
              onClick={() => scrollMobileTo(i)}
              className="cursor-pointer p-0 m-0 border-0 bg-transparent">
              <span
                className="block transition-all duration-300 rounded-full"
                style={{
                  width: i === mobileActiveIdx ? 24 : 8,
                  height: 8,
                  background:
                    i === mobileActiveIdx
                      ? "#0086b0"
                      : "rgba(255,255,255,0.25)",
                }}
              />
            </button>
          ))}
        </div>

        <div className="flex justify-center mt-7 px-[6vw]">
          <Link
            href="/realizacje"
            className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-white font-semibold uppercase tracking-[0.15em] no-underline hover:opacity-90 transition-opacity"
            style={{
              fontSize: "0.78rem",
              background: "#0086b0",
            }}>
            Zobacz wszystkie realizacje
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="px-[6vw] pt-[14vh]">
          <p
            className="m-0 mb-3 uppercase tracking-[0.22em] font-semibold text-[#0086b0]"
            style={{ fontSize: "0.72rem" }}>
            System obslugi zamowien
          </p>
          <h3
            className="m-0 mb-8 font-bold tracking-tight"
            style={{
              fontSize: "clamp(1.5rem, 6vw, 2rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}>
            PickUpWall
          </h3>
          <div className="flex flex-col gap-7">
            {[
              [
                "PickUpWall",
                "Efektowna, modularna szafa ze skrytkami do automatycznego odbioru zamowien klientow ecommerce.",
              ],
              [
                "Latwosc obslugi",
                "Czytelny ekran LCD, czytnik kodow QR umozliwiajace latwy i bezdotykowy odbior paczki.",
              ],
              [
                "Zamowienia 360",
                "System z pelnym procesem obslugi zamowienia od otrzymania szczegolow, przez obsluge umieszczenia paczki, po komunikacje do klienta.",
              ],
            ].map(([title, desc]) => (
              <div key={title}>
                <h4
                  className="m-0 mb-2 font-bold uppercase tracking-wider text-white"
                  style={{ fontSize: "0.92rem" }}>
                  {title}
                </h4>
                <p
                  className="m-0 text-white/65 leading-relaxed"
                  style={{ fontSize: "0.88rem" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={pinWrapperRef} className="max-lg:hidden relative w-full overflow-hidden" style={{ height: "260vh" }}>
      <div
        ref={pinChildRef}
        className="bg-[#0f0f0f]"
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100vh", overflow: "hidden" }}
      >
        {/* full-frame bg image with parallax */}
        <div
          ref={bgWrapperRef}
          className="rl-carousel__bg rl-carousel__bg--full"
        >
          <img
            src={REALIZATIONS[initialActive].image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

        <div className="rl-section-bg-frame" aria-hidden="true" />

        <section className="relative z-[2] w-full h-full text-white">
          {/* Slider is rendered as an empty container — the 3 initial
              slides are appended imperatively in useEffect below so that
              transition()'s appendChild / .remove() calls don't fight
              React's reconciliation tree on unmount. */}
          <div
            ref={sliderRef}
            onClick={onSliderClick}
            className="absolute inset-0"
            suppressHydrationWarning
          />

          {/* "Wszystkie realizacje" button — bottom-right corner. */}
          <Link
            href="/realizacje"
            className="rl-fade-with-reveal absolute right-[3vw] bottom-10 z-[5] inline-flex items-center gap-2 text-white no-underline px-6 py-3 rounded-full border border-white/30 hover:bg-white/15 transition-colors"
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 600,
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(6px)",
            }}>
            Wszystkie realizacje
            <span aria-hidden="true">&rarr;</span>
          </Link>

          {/* Fixed-position caption — sits ON the active slide and extends
              LEFT/DOWN. Each text line has its own overflow:hidden wrapper
              so the inner span can slide past the line on transition: old
              text collapses down past the horizon, new text drops in from
              above. */}
          <div
            className="rl-fade-with-reveal absolute z-[15] pointer-events-none text-left"
            style={{
              left: "22vw",
              top: "58vh",
              width: "clamp(360px, 38vw, 720px)",
            }}>
            <TextRotate
              ref={captionLocRef}
              texts={REALIZATIONS.map((r) => r.location)}
              auto={false}
              splitBy="characters"
              staggerFrom="random"
              staggerDuration={0.015}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              mainClassName="m-0 mb-2 uppercase tracking-[0.28em] font-semibold overflow-hidden"
              style={{
                color: "#7ed5e6",
                fontSize: "0.78rem",
                textShadow: "0 2px 12px rgba(0,0,0,0.55)",
                lineHeight: 1.3,
                display: "flex",
                flexWrap: "wrap",
              }}
            />
            <TextRotate
              ref={captionTitleRef}
              as="h3"
              texts={REALIZATIONS.map((r) => r.title)}
              auto={false}
              splitBy="characters"
              staggerFrom="random"
              staggerDuration={0.02}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              mainClassName="m-0 mb-4 font-bold text-white overflow-hidden"
              style={{
                fontSize: "clamp(2.2rem, 3.6vw, 4rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                paddingBottom: "0.12em",
                display: "flex",
                flexWrap: "wrap",
              }}
            />
            <a
              ref={captionCtaRef}
              href={`/realizacje/${REALIZATIONS[initialActive].slug}`}
              onClick={(e) => {
                e.preventDefault();
                flyToDetail(REALIZATIONS[activeIdxRef.current].slug);
              }}
              className="inline-flex items-center gap-2 text-white no-underline"
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 600,
                pointerEvents: "auto",
                borderBottom: "1px solid rgba(255,255,255,0.45)",
                paddingBottom: 4,
                textShadow: "0 2px 10px rgba(0,0,0,0.55)",
              }}>
              Zobacz realizacje
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          <div ref={itemsRef} className="hidden" aria-hidden="true" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              transition("prev");
            }}
            aria-label="Poprzedni"
            className="rl-fade-with-reveal absolute left-[2vw] top-1/2 z-20 cursor-pointer flex items-center justify-center"
            style={{
              transform: "translateY(-50%)",
              width: "52px",
              height: "52px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "50%",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              transition("next");
            }}
            aria-label="Nastepny"
            className="rl-fade-with-reveal absolute right-[2vw] top-1/2 z-20 cursor-pointer flex items-center justify-center"
            style={{
              transform: "translateY(-50%)",
              width: "52px",
              height: "52px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "50%",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </section>

        <div className="rl-reveal-text" aria-hidden="true">
          <p
            className="rl-reveal-text-line"
            style={{
              ["--line-start" as never]: 0.14,
              ["--line-duration" as never]: 0.42,
              ["--line-x-offset" as never]: "-8vw",
            }}
          >
            <span className="rl-reveal-line-title">PickUpWall</span>
            <span className="rl-reveal-line-desc">
              Efektowna, modularna szafa ze skrytkami do automatycznego odbioru
              zamowien klientow ecommerce.
            </span>
          </p>
          <p
            className="rl-reveal-text-line"
            style={{
              ["--line-start" as never]: 0.26,
              ["--line-duration" as never]: 0.42,
              ["--line-x-offset" as never]: "-16vw",
            }}
          >
            <span className="rl-reveal-line-title">Latwosc obslugi</span>
            <span className="rl-reveal-line-desc">
              Czytelny ekran LCD, czytnik kodow QR umozliwiajace latwy i
              bezdotykowy odbior paczki.
            </span>
          </p>
          <p
            className="rl-reveal-text-line"
            style={{
              ["--line-start" as never]: 0.38,
              ["--line-duration" as never]: 0.42,
              ["--line-x-offset" as never]: "-24vw",
            }}
          >
            <span className="rl-reveal-line-title">Zamowienia 360</span>
            <span className="rl-reveal-line-desc">
              System z pelnym procesem obslugi zamowienia od otrzymania
              szczegolow, przez obsluge umieszczenia paczki, po komunikacje do
              klienta.
            </span>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
