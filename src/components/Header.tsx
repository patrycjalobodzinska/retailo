"use client";

import { useEffect, useState } from "react";
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
  { label: "Rozwiazanie", target: "rozwiazanie", vhOffset: 1.4 },
  { label: "Realizacje", target: "realizacje", vhOffset: 0.15 },
  { label: "Kontakt", target: "kontakt" },
];

export default function Header() {
  const pathname = usePathname();
  // Homepage uses the light-text variant (sits over the dark hero image
  // at the top); every other route uses the dark-text variant.
  const isSubpage = pathname !== "/";

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
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
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(top, { duration: 1.2 });
    } else {
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className="sticky top-0 left-0 right-0 z-[100] flex items-center justify-between"
        style={{
          paddingLeft: "5vw",
          paddingRight: "5vw",
          paddingTop: 16,
          paddingBottom: 16,
          background: "transparent",
          // Pull the rest of the page up underneath the header so it
          // overlays content (like the hero image) rather than pushing
          // it down. Header's actual visual height (the pills) is
          // ~64px; this negative margin matches that.
          marginBottom: -72,
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
