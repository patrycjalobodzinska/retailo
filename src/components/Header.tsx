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
  { label: "Rozwiazanie", target: "rozwiazanie", vhOffset: 0.15 },
  { label: "Realizacje", target: "realizacje", vhOffset: 0.05 },
  { label: "Kontakt", target: "kontakt" },
];

export default function Header() {
  const pathname = usePathname();
  // Homepage (i test2 = klon homepage) uses the dark-pill variant nad
  // jasnym hero; każda inna trasa używa light variant nad ciemnym tłem.
  const isSubpage = pathname !== "/" && pathname !== "/test2";

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
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between"
        style={{
          paddingLeft: "5vw",
          paddingRight: "5vw",
          paddingTop: 16,
          paddingBottom: 16,
          background: "transparent",
        }}>
        <a
          href="/"
          onClick={(e) => {
            setOpen(false);
            // On subpages let the browser navigate normally to "/".
            // On the home page intercept and smooth-scroll to the top.
            if (isSubpage) return;
            e.preventDefault();
            const lenis = window.__lenis;
            if (lenis) lenis.scrollTo(0, { duration: 1.1 });
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="inline-flex items-center no-underline"
          aria-label="retailo. — strona glowna"
          style={{
            background: isSubpage
              ? "rgba(255,255,255,0.85)"
              : "rgba(42,56,64,0.5)",
            border: isSubpage
              ? "1px solid rgba(10,42,46,0.08)"
              : "1px solid rgba(255,255,255,0.12)",
            padding: "8px 16px",
            borderRadius: 999,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
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
              ? "rgba(255,255,255,0.85)"
              : "rgba(42,56,64,0.5)",
            border: isSubpage
              ? "1px solid rgba(10,42,46,0.08)"
              : "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: "6px 8px",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
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
              ? "rgba(255,255,255,0.92)"
              : "rgba(42,56,64,0.7)",
            border: isSubpage
              ? "1px solid rgba(10,42,46,0.08)"
              : "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
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

      {/* Mobile drawer — editorial light style pasujący do Hero/QASection */}
      <div
        className={`md:hidden fixed inset-0 z-[99] transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          background:
            "linear-gradient(180deg, #fafaf8 0%, #f4efe6 60%, #ebe4d5 100%)",
        }}
        onClick={() => setOpen(false)}>
        <div
          className="relative flex h-full flex-col"
          onClick={(e) => e.stopPropagation()}>
          {/* Subtelna siatka kropek w tle */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ opacity: 0.4 }}>
            <defs>
              <pattern
                id="menu-dots"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#0a2a2e" fillOpacity="0.12" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#menu-dots)" />
          </svg>

          {/* Top bar — eyebrow + close */}
          <div className="relative z-[1] flex items-center justify-between px-[6vw] pt-[2dvh]">
            <span
              className="font-mono uppercase tracking-[0.28em] text-[#0a2a2e]/55"
              style={{ fontSize: "0.58rem" }}>
              Menu · v2026
            </span>
            <button
              type="button"
              aria-label="Zamknij menu"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0a2a2e]/10 bg-white/60 text-[#0a2a2e] transition active:scale-95"
              style={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true">
                <path d="M6 6L18 18M6 18L18 6" />
              </svg>
            </button>
          </div>

          {/* Nav list — numbered items with hairline dividers */}
          <nav className="relative z-[1] mt-[10dvh] flex flex-col px-[6vw]">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item.label}
                href={`#${item.target}`}
                onClick={(e) => handleNavClick(e, item)}
                className="group relative flex items-end justify-between gap-4 border-b border-[#0a2a2e]/10 py-5 no-underline transition-transform"
                style={{
                  transform: open ? "translateY(0)" : "translateY(20px)",
                  opacity: open ? 1 : 0,
                  transitionDuration: "400ms",
                  transitionDelay: open ? `${120 + i * 70}ms` : "0ms",
                  transitionProperty: "transform, opacity",
                }}>
                <div className="flex items-baseline gap-4">
                  <span
                    className="font-mono uppercase tracking-[0.2em] text-[#0a2a2e]/40"
                    style={{ fontSize: "0.58rem" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="font-semibold tracking-tight text-[#0a2a2e]"
                    style={{
                      fontSize: "clamp(1.8rem, 8vw, 2.4rem)",
                      lineHeight: 1.05,
                      letterSpacing: "-0.025em",
                    }}>
                    {item.label}
                  </span>
                </div>
                <span
                  aria-hidden
                  className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#0a2a2e] text-white transition-transform group-active:scale-95">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M5 12h14M19 12l-6-6M19 12l-6 6" />
                  </svg>
                </span>
              </a>
            ))}
          </nav>

          {/* Footer area — language switcher + contact pill */}
          <div className="relative z-[1] mt-auto flex flex-col gap-4 px-[6vw] pb-[5dvh] pt-8">
            <div
              className="flex items-center gap-3"
              style={{
                transform: open ? "translateY(0)" : "translateY(20px)",
                opacity: open ? 1 : 0,
                transitionDuration: "400ms",
                transitionDelay: open ? "320ms" : "0ms",
                transitionProperty: "transform, opacity",
              }}>
              <span
                className="font-mono uppercase tracking-[0.22em] text-[#0a2a2e]/55"
                style={{ fontSize: "0.56rem" }}>
                Jezyk
              </span>
              <span className="block h-px flex-1 bg-[#0a2a2e]/15" />
              <LanguageSwitcher variant="drawer" />
            </div>
            <a
              href="mailto:info@retailo.pl"
              className="font-mono uppercase tracking-[0.22em] text-[#0a2a2e]/65 no-underline"
              style={{
                fontSize: "0.56rem",
                transform: open ? "translateY(0)" : "translateY(20px)",
                opacity: open ? 1 : 0,
                transitionDuration: "400ms",
                transitionDelay: open ? "380ms" : "0ms",
                transitionProperty: "transform, opacity",
              }}>
              info@retailo.pl
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
