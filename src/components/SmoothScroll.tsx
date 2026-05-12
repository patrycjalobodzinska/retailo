"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    // Disable the browser's automatic scroll restoration so a hard
    // refresh always lands the user at the top of the page (otherwise
    // refreshing mid-section lands you back in the middle of a pinned
    // ScrollTrigger timeline, which is visually disorienting).
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    window.__lenis = lenis;

    // Drive Lenis off GSAP's single ticker and notify ScrollTrigger on
    // every scroll event so pinned timelines stay synced with smooth
    // scrolling.
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // After every image / font finishes loading, ScrollTrigger needs to
    // recompute pin-spacer heights — otherwise sections sized at hydration
    // (when images were 0×0) overlap each other once images flow in.
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      requestAnimationFrame(refresh);
    } else {
      window.addEventListener("load", refresh, { once: true });
    }
    document.fonts?.ready?.then(() => ScrollTrigger.refresh());

    // Window resize: pin-spacers freeze their width/height at the moment
    // the pin was created, so a wider viewport later leaves black bars on
    // the sides of pinned sections. Debounce a ScrollTrigger.refresh() to
    // recompute everything when the viewport changes.
    let resizeTimer: number | undefined;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 120);
    };
    window.addEventListener("resize", onResize);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", onResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
    };
  }, []);

  // On every client-side route change: snap to the top of the new page,
  // then refresh ScrollTrigger after the next paint so the freshly
  // mounted pinned sections compute pin-spacer sizes against the new
  // layout. Without this the homepage briefly renders with stale (or
  // un-initialized) pin positions when navigating back from /realizacje.
  useEffect(() => {
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);

    // Two-stage refresh: first frame after navigation kicks ScrollTrigger
    // to recompute against the post-mount DOM; a second pass once images
    // resolve catches any layout shift from async-loading hero/section
    // images.
    const raf1 = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      cancelAnimationFrame(raf1);
      window.clearTimeout(t);
    };
  }, [pathname]);

  return null;
}
