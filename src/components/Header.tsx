"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

type NavItem = {
  label: string;
  target: string;
  // Optional offset (in viewport heights) added on top of the target
  // element's top — used to land partway into a pinned/long section.
  vhOffset?: number;
};

const NAV_ITEMS: NavItem[] = [
  // "Rozwiazanie" → ~1.4 viewports into the pinned ProductShowcase so the
  // image has fully arrived and lifted into its resting position, with the
  // heading + features visible alongside.
  { label: "Rozwiazanie", target: "rozwiazanie", vhOffset: 1.4 },
  { label: "Realizacje", target: "realizacje", vhOffset: 0.15 },
  { label: "Kontakt", target: "kontakt" },
];

const HERO_THRESHOLD = 0.85; // header is "in hero" while scrollY < 85vh

export default function Header() {
  const pathname = usePathname();
  // Homepage has the hero image behind the header (light text variant);
  // every other route lives on a light page background and needs the
  // dark-text variant pinned in glass-pill form.
  const isSubpage = pathname !== "/";

  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [inHero, setInHero] = useState(!isSubpage);
  const [suppressTransition, setSuppressTransition] = useState(false);
  const lastYRef = useRef(0);
  const lastInHeroRef = useRef(!isSubpage);
  // After clicking a nav item we trigger a programmatic smooth scroll; the
  // scroll-direction handler would otherwise hide the header mid-jump.
  const navLockUntilRef = useRef(0);

  // No intro animation — the header is hidden while the hero is visible
  // and only slides down once the user scrolls past it.

  useEffect(() => {
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const heroHeight = window.innerHeight * HERO_THRESHOLD;
      // Subpages don't have a hero behind the header — keep it permanently
      // in the fixed-pill form so the scroll-direction reveal/hide still
      // works but the "in hero" branch never engages.
      const hero = isSubpage ? false : y < heroHeight;
      const delta = y - lastYRef.current;
      const justExitedHero = lastInHeroRef.current && !hero;

      setInHero(hero);

      // While a nav-click smooth-scroll is animating, keep the header
      // pinned visible — otherwise it slides off mid-jump and the user
      // sees the closing X get cut.
      if (performance.now() < navLockUntilRef.current) {
        setVisible(true);
        lastYRef.current = y;
        lastInHeroRef.current = hero;
        return;
      }

      if (!hero) {
        if (justExitedHero) {
          setVisible(delta < 0);
          // Going from absolute (in hero) to fixed at top:16 while the
          // transform tweens 0 → -130% would leave the pill briefly visible
          // at top:16 with its black background. Suppress the transform
          // transition for one frame so the pill snaps off-screen instead
          // of sliding in and back out.
          if (delta > 0) {
            setSuppressTransition(true);
            window.setTimeout(() => setSuppressTransition(false), 80);
          }
        } else if (Math.abs(delta) > 6) {
          setVisible(delta < 0);
        }
      }
      lastYRef.current = y;
      lastInHeroRef.current = hero;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    let lenisOff: (() => void) | undefined;
    const tryAttachLenis = () => {
      const lenis = window.__lenis;
      if (lenis) {
        lenis.on("scroll", onScroll);
        lenisOff = () => lenis.off("scroll", onScroll);
        return true;
      }
      return false;
    };
    let intervalId: number | undefined;
    if (!tryAttachLenis()) {
      intervalId = window.setInterval(() => {
        if (tryAttachLenis()) {
          if (intervalId) window.clearInterval(intervalId);
        }
      }, 100);
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
      window.removeEventListener("scroll", onScroll);
      if (lenisOff) lenisOff();
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setVisible(true);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem,
  ) => {
    e.preventDefault();
    setOpen(false);
    const el = document.getElementById(item.target);
    if (!el) return;
    const elTop = el.getBoundingClientRect().top + window.scrollY;
    const extra = (item.vhOffset ?? 0) * window.innerHeight;
    const top = elTop + extra - 80;
    // Lenis takes ~1.2s with our duration; lock the visibility through
    // the whole tween plus a small grace period.
    navLockUntilRef.current = performance.now() + 1500;
    setVisible(true);
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(top, { duration: 1.2 });
    } else {
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // While in hero we keep the header transparent over the dark image; once
  // the user has scrolled past the hero we render a compact pill that can
  // hide on scroll-down and re-appear on scroll-up.
  return (
    <>
      <header
        ref={headerRef}
        className="left-0 right-0 z-[100] flex items-center justify-between"
        style={{
          // In hero: absolute at the top of the page — header is part of
          // the hero, scrolls away with the page on scroll-down, and is
          // re-encountered when scrolling back up to the top.
          // After hero: fixed glass pill that reveals on scroll-up and
          // hides on scroll-down.
          position: inHero ? "absolute" : "fixed",
          top: inHero ? 0 : 16,
          paddingLeft: "5vw",
          paddingRight: "5vw",
          paddingTop: inHero ? 18 : 0,
          paddingBottom: inHero ? 18 : 0,
          transform: inHero || visible ? "translateY(0)" : "translateY(-130%)",
          transition:
            inHero || suppressTransition ? "none" : "transform 450ms ease",
          background: "transparent",
          pointerEvents: inHero || visible ? "auto" : "none",
        }}>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            const lenis = window.__lenis;
            if (lenis) lenis.scrollTo(0, { duration: 1.1 });
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="inline-flex backdrop-blur-sm items-center no-underline"
          aria-label="retailo. — strona glowna"
          style={{
            // Always-on glass pill: dark variant on homepage (over the hero
            // image and post-hero dark sections), light variant on subpages.
            background: isSubpage
              ? "rgba(255,255,255,0.4)"
              : "rgba(15,21,24,0.2)",

            WebkitBackdropFilter: "blur(14px) saturate(140%)",
            border: isSubpage
              ? "1px solid rgba(10,42,46,0.08)"
              : "1px solid rgba(255,255,255,0.12)",
            padding: "8px 16px",
            borderRadius: 999,
          }}>
          {/* Two logo files: regular (dark) for light backgrounds, light
              (white) for dark backgrounds. */}
          <img
            src={isSubpage ? "/retailologo.webp" : "/retailologo_light.webp"}
            alt="retailo."
            style={{ height: 22, width: "auto", display: "block" }}
          />
        </a>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center"
          style={{
            gap: 4,
            background: isSubpage
              ? "rgba(255,255,255,0.4)"
              : "rgba(15,21,24,0.2)",
            backdropFilter: "blur(14px) saturate(140%)",
            WebkitBackdropFilter: "blur(14px) saturate(140%)",
            border: isSubpage
              ? "1px solid rgba(10,42,46,0.08)"
              : "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: "6px 8px",
          }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={`#${item.target}`}
              onClick={(e) => handleNavClick(e, item)}
              className={`text-[14px] font-semibold no-underline tracking-wide px-4 py-2 rounded-full transition-colors cursor-pointer ${
                isSubpage
                  ? "text-[#0a2a2e] hover:bg-[#0a2a2e]/8"
                  : "text-white hover:bg-white/10"
              }`}>
              {item.label}
            </a>
          ))}
          <div
            className="ml-2 pl-2"
            style={{
              borderLeft: isSubpage
                ? "1px solid rgba(10,42,46,0.12)"
                : "1px solid rgba(255,255,255,0.12)",
            }}>
            <LanguageSwitcher variant="header" />
          </div>
        </nav>

        {/* Mobile burger */}
        <button
          type="button"
          aria-label={open ? "Zamknij menu" : "Otworz menu"}
          onClick={() => setOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1.5 cursor-pointer w-12 h-12 justify-center items-center"
          style={{
            background: isSubpage
              ? "rgba(255,255,255,0.88)"
              : "rgba(15,21,24,0.55)",
            backdropFilter: "blur(14px) saturate(140%)",
            WebkitBackdropFilter: "blur(14px) saturate(140%)",
            border: isSubpage
              ? "1px solid rgba(10,42,46,0.08)"
              : "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
          }}>
          {(() => {
            const bar = isSubpage ? "block bg-[#0a2a2e]" : "block bg-white";
            return (
              <>
                <span
                  className={`${bar} transition-transform duration-300`}
                  style={{
                    width: 16,
                    height: 2,
                    transform: open ? "translateY(4px) rotate(45deg)" : "none",
                  }}
                />
                <span
                  className={`${bar} transition-opacity duration-300`}
                  style={{ width: 16, height: 2, opacity: open ? 0 : 1 }}
                />
                <span
                  className={`${bar} transition-transform duration-300`}
                  style={{
                    width: 16,
                    height: 2,
                    transform: open
                      ? "translateY(-6px) rotate(-45deg)"
                      : "none",
                  }}
                />
              </>
            );
          })()}
        </button>
      </header>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[99] transition-opacity duration-400 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(15, 21, 24, 0.96)" }}
        onClick={() => setOpen(false)}>
        <nav
          className="flex flex-col gap-2 px-[8vw] pt-[18vh]"
          onClick={(e) => e.stopPropagation()}>
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.label}
              href={`#${item.target}`}
              onClick={(e) => handleNavClick(e, item)}
              className="text-white text-3xl font-bold no-underline tracking-tight py-2 transition-transform"
              style={{
                transform: open ? "translateX(0)" : "translateX(-20px)",
                opacity: open ? 1 : 0,
                transitionDuration: "400ms",
                transitionDelay: open ? `${100 + i * 60}ms` : "0ms",
                transitionProperty: "transform, opacity",
              }}>
              {item.label}
            </a>
          ))}
          <div className="mt-8">
            <LanguageSwitcher variant="drawer" />
          </div>
        </nav>
      </div>
    </>
  );
}
