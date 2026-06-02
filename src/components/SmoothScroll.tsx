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
    // Na /admin (Sanity Studio) nie inicjalizujemy Lenis — przejmowałby
    // scroll i psuł UI Studia.
    if (pathname?.startsWith("/admin")) return;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // Lekka konfiguracja Lenis — mniej smoothingu, niezależny RAF.
    // Wcześniejsza wersja drivowała Lenis z GSAP'owego tickera +
    // wołała ScrollTrigger.update() na każdy event, co skutecznie
    // łamało perf w sekcjach ze sticky. Teraz Lenis ma własny RAF,
    // a ScrollTrigger sam się synchronizuje przez window scroll event.
    // Klasyczny "Lenis feel" — długie, miękkie wygładzanie z cubic ease.
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      syncTouch: false,
    });
    window.__lenis = lenis;

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // ScrollTrigger refresh after async asset load — bez bindowania
    // ScrollTrigger.update do każdego eventu Lenis (to było źródłem
    // ciężkiego repaintu w sekcjach ze sticky).
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      requestAnimationFrame(refresh);
    } else {
      window.addEventListener("load", refresh, { once: true });
    }
    document.fonts?.ready?.then(() => ScrollTrigger.refresh());

    // ScrollTrigger.refresh TYLKO przy zmianie szerokości. Na mobile (iOS
    // Safari) pasek URL chowa/pokazuje się podczas scrolla, zmieniając
    // WYSOKOŚĆ viewportu — to wyzwalało refresh co chwilę i powodowało lag
    // dokładnie w momencie wjazdu/zjazdu paska. Wysokość ignorujemy.
    let resizeTimer: number | undefined;
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 120);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", onResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);

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
