"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HomePage, Realization } from "@/lib/sanity/fetch";
import { useLang } from "@/lib/i18n/LanguageProvider";

// Mobile: cards take most of the viewport with a small side peek.
// Desktop overridden via responsive Tailwind classes below.
// Sized so 3 cards + 2 gaps always fit within the viewport on desktop
// (3 * 28vw + 2 * 24px ≈ 84vw + 48px, leaves safe margins from md up).
const CARD_W_DESKTOP = "clamp(220px, 28vw, 420px)";
const CARD_GAP_DESKTOP = "24px";

type RealizationsCarouselProps = {
  showHeader?: boolean;
  excludeSlug?: string;
  variant?: "light" | "dark";
  items?: Realization[];
  data?: HomePage;
};

export default function RealizationsCarousel({
  showHeader = true,
  excludeSlug,
  variant = "light",
  items: itemsProp,
  data,
}: RealizationsCarouselProps = {}) {
  const router = useRouter();
  const { t } = useLang();
  const eyebrow = t(data?.realizationsEyebrow ?? null) || "Realizacje";
  const headlinePrefix =
    t(data?.realizationsHeadline ?? null) ||
    "Wspolpracujemy z najwiekszymi markami.";
  const intro =
    t(data?.realizationsIntro ?? null) ||
    "PickUpWall wdrazany w salonach kosmetycznych, fashion i elektroniki.";
  const ctaLabel =
    t(data?.realizationsCtaLabel ?? null) || "Zobacz wszystkie realizacje";
  const items = (
    excludeSlug
      ? (itemsProp ?? []).filter((r) => r.slug !== excludeSlug)
      : (itemsProp ?? [])
  );
  const len = items.length;

  // Render items 3 times so there is always a neighbour on each side of
  // the centred card. Start the index in the middle copy so the user can
  // navigate freely in either direction; after each transition we snap
  // back to the middle copy without a visible jump.
  const tripled = [...items, ...items, ...items];
  const [index, setIndex] = useState(len);
  const [animate, setAnimate] = useState(true);

  const go = useCallback((d: 1 | -1) => {
    setAnimate(true);
    setIndex((i) => i + d);
  }, []);

  // Wrap-around: after transition ends, silently jump back into the
  // middle copy so the carousel feels infinite.
  const handleTransitionEnd = () => {
    if (index >= 2 * len) {
      setAnimate(false);
      setIndex(index - len);
    } else if (index < len) {
      setAnimate(false);
      setIndex(index + len);
    }
  };

  // Re-enable transitions one frame after a silent jump.
  useEffect(() => {
    if (!animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Touch swipe (mobile drag)
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    const dx = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (Math.abs(dx) < 40) return; // ignore taps / tiny moves
    go(dx < 0 ? 1 : -1);
  };

  return (
    <section className="relative w-full overflow-hidden bg-white pt-12 pb-8 md:pt-14 md:pb-28">
      {showHeader && (
      <div className="relative z-10 mx-auto max-w-[1100px] px-6 mb-4 md:mb-10 text-center">
        <p
          className="m-0 mb-2 uppercase tracking-[0.3em] font-semibold text-[#7a7a7a]"
          style={{ fontSize: "0.62rem" }}>
          {eyebrow}
        </p>
        <h2
          className="m-0 font-bold tracking-tight text-[#0f0f0f]"
          style={{
            fontSize: "clamp(1.4rem, 2.4vw, 2.2rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}>
          <span
            className="font-extrabold"
            style={{
              background:
                "linear-gradient(135deg, #0086b0 0%, #16404a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
            {headlinePrefix}
          </span>
        </h2>
        <p
          className="m-0 mt-2.5 mx-auto font-light text-[#5a5a5a] leading-relaxed"
          style={{
            fontSize: "clamp(0.82rem, 0.9vw, 0.92rem)",
            maxWidth: "480px",
          }}>
          {intro}
        </p>
      </div>
      )}

      <div
        className="relative z-10 w-full [--card-w:86vw] [--card-gap:16px] md:[--card-gap:var(--card-gap-md)] md:[--card-w:var(--card-w-md)]"
        style={
          {
            ["--card-w-md" as string]: CARD_W_DESKTOP,
            ["--card-gap-md" as string]: CARD_GAP_DESKTOP,
          } as React.CSSProperties
        }
      >
        {/* Track viewport — outer section already clips horizontally, so
            we let this layer be overflow-visible vertically so card
            shadows aren't sliced off at the top/bottom. */}
        <div
          className="relative h-[56vh] min-h-[420px] w-full md:h-[60vh] touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}>
          <div
            onTransitionEnd={handleTransitionEnd}
            className="absolute top-1/2 left-0 flex h-[88%] -translate-y-1/2 items-center will-change-transform"
            style={{
              gap: "var(--card-gap)",
              transform: `translateX(calc(50vw - var(--card-w) / 2 - ${index} * (var(--card-w) + var(--card-gap))))`,
              transition: animate
                ? "transform 720ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
            }}
          >
            {tripled.map((item, i) => {
              const isActive = i === index;
              const handleClick = () => {
                if (!isActive) {
                  setAnimate(true);
                  setIndex(i);
                  return;
                }
                router.push(`/realizacje/${item.slug}`);
              };
              const brand =
                item.client && item.client !== "—" ? item.client : null;
              const hasBadges =
                !!item.config?.lockers ||
                !!item.integrationTime ||
                (item.tags && item.tags.length > 0);

              if (variant === "dark") {
                return (
                  <article
                    key={`${item.slug}-${i}`}
                    onClick={handleClick}
                    className="group relative h-full shrink-0 cursor-pointer rounded-2xl overflow-hidden bg-[#0f1518] transition-all duration-700 ease-out opacity-100"
                    style={{
                      width: "var(--card-w)",
                      transform: isActive ? "scale(1.1)" : "scale(0.92)",
                      transformOrigin: "center",
                      zIndex: isActive ? 2 : 1,
                      boxShadow: isActive
                        ? "0 24px 56px rgba(15,42,46,0.22)"
                        : "0 14px 40px rgba(15,42,46,0.12)",
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 90vw, 60vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="eager"
                      priority={isActive}
                    />
                    {brand && (
                      <span
                        className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-[0.18em] font-bold text-[#0a2a2e]"
                        style={{
                          fontSize: "0.62rem",
                          background: "rgba(255,255,255,0.92)",
                          border: "1px solid rgba(10,42,46,0.06)",
                          boxShadow: "0 4px 14px rgba(15,21,24,0.18)",
                        }}
                      >
                        <span
                          className="block rounded-full"
                          style={{ width: 6, height: 6, background: "#0086b0" }}
                        />
                        {brand}
                      </span>
                    )}
                    {item.year && (
                      <span
                        className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-full uppercase tracking-[0.15em] font-bold text-white"
                        style={{
                          fontSize: "0.6rem",
                          background: "rgba(8,12,14,0.55)",
                          backdropFilter: "blur(6px)",
                          WebkitBackdropFilter: "blur(6px)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      >
                        {item.year}
                      </span>
                    )}
                    <div
                      className="absolute inset-x-0 bottom-0 z-[2] px-5 py-4"
                      style={{
                        background: "rgba(8,12,14,0.45)",
                        backdropFilter: "blur(4px)",
                        WebkitBackdropFilter: "blur(4px)",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <p
                        className="m-0 mb-1 uppercase tracking-[0.2em] font-semibold text-[#7ed5e6]"
                        style={{ fontSize: "0.62rem" }}
                      >
                        {item.location}
                      </p>
                      <h3
                        className="m-0 mb-1.5 font-bold text-white"
                        style={{
                          fontSize: "1.2rem",
                          lineHeight: 1.15,
                          letterSpacing: "-0.015em",
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="m-0 text-white/85 leading-snug line-clamp-2"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {item.description}
                      </p>
                      {hasBadges && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {item.config?.lockers && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full uppercase tracking-[0.12em] font-semibold text-white/85"
                              style={{
                                fontSize: "0.58rem",
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.10)",
                              }}
                            >
                              {item.config.lockers} skrytek
                            </span>
                          )}
                          {item.integrationTime && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full uppercase tracking-[0.12em] font-semibold text-white/85"
                              style={{
                                fontSize: "0.58rem",
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.10)",
                              }}
                            >
                              {item.integrationTime}
                            </span>
                          )}
                          {item.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded-full uppercase tracking-[0.12em] font-semibold text-[#7ed5e6]"
                              style={{
                                fontSize: "0.58rem",
                                background: "rgba(0,134,176,0.16)",
                                border: "1px solid rgba(126,213,230,0.22)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={`${item.slug}-${i}`}
                  onClick={handleClick}
                  className="relative h-full shrink-0 cursor-pointer rounded-2xl transition-all duration-700 ease-out opacity-100"
                  style={{
                    width: "var(--card-w)",
                    transform: isActive ? "scale(1.1)" : "scale(0.92)",
                    transformOrigin: "center",
                    zIndex: isActive ? 2 : 1,
                    background: isActive
                      ? "rgba(172, 170, 165, 0.48)"
                      : "rgba(212, 214, 216, 0.42)",
                    boxShadow: isActive
                      ? "0 24px 56px rgba(15,42,46,0.12)"
                      : "0 14px 40px rgba(15,42,46,0.07)",
                  }}
                >
                  <div className="flex h-full flex-col p-5 md:p-7">
                    <div className="relative w-full flex-1 overflow-hidden rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 90vw, 60vw"
                        className="object-cover"
                        loading="eager"
                        priority={isActive}
                      />
                      {brand && (
                        <span
                          className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full uppercase tracking-[0.18em] font-bold text-[#0a2a2e]"
                          style={{
                            fontSize: "0.58rem",
                            background: "rgba(255,255,255,0.92)",
                            border: "1px solid rgba(10,42,46,0.06)",
                            boxShadow: "0 4px 14px rgba(15,21,24,0.18)",
                          }}
                        >
                          <span
                            className="block rounded-full"
                            style={{
                              width: 5,
                              height: 5,
                              background: "#0086b0",
                            }}
                          />
                          {brand}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex flex-col items-center gap-1.5 text-center md:mt-5">
                      <h3
                        className="m-0 font-semibold uppercase tracking-[0.16em] text-[#0a2a2e]"
                        style={{
                          fontSize: "clamp(0.95rem, 1.15vw, 1.15rem)",
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="m-0 font-light leading-snug text-[#3a5a60] line-clamp-2"
                        style={{ fontSize: "clamp(0.78rem, 0.9vw, 0.9rem)" }}
                      >
                        {item.description}
                      </p>
                      {item.config?.lockers && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 self-start justify-start">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full uppercase tracking-[0.12em] font-semibold text-[#0a2a2e]/80"
                            style={{
                              fontSize: "0.55rem",
                              background: "rgba(255,255,255,0.55)",
                              border: "1px solid rgba(10,42,46,0.08)",
                            }}
                          >
                            {item.config.lockers} skrytek
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Controls + CTA below the track */}
        <div className="relative mx-auto mt-8 md:mt-14 flex w-full max-w-[1100px] flex-col items-center gap-5 px-6">
          {/* Mobile-only carousel position dots — sugerują, że to karuzela */}
          <div className="flex items-center gap-1.5 md:hidden" aria-hidden="true">
            {Array.from({ length: len }).map((_, i) => {
              const active = ((index % len) + len) % len === i;
              return (
                <span
                  key={i}
                  className="block rounded-full transition-all duration-300"
                  style={{
                    width: active ? "20px" : "6px",
                    height: "6px",
                    background: active ? "#0a2a2e" : "rgba(10,42,46,0.22)",
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-4 md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2">
            <button
              onClick={() => go(-1)}
              aria-label="Poprzednia"
              className="grid h-12 w-12 md:h-14 md:w-14 place-items-center rounded-full border border-[#0a2a2e]/20 text-[#0a2a2e]/80 transition hover:border-[#0a2a2e]/60 hover:text-[#0a2a2e]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M5 12l6-6M5 12l6 6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Nastepna"
              className="grid h-12 w-12 md:h-14 md:w-14 place-items-center rounded-full bg-[#0a2a2e] text-white transition hover:bg-[#16404a]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M19 12l-6-6M19 12l-6 6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* CTA button — pełnoprawny przycisk pod strzałkami */}
          <Link
            href="/realizacje"
            className="inline-flex items-center gap-2 rounded-full bg-[#0a2a2e] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white no-underline transition hover:bg-[#16404a] md:bg-transparent md:text-[#3a5a60] md:px-0 md:py-0 md:font-medium md:hover:bg-transparent md:hover:text-[#0a2a2e]"
          >
            {ctaLabel}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform">
              <path
                d="M5 12h14M19 12l-6-6M19 12l-6 6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
