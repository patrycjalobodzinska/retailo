"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { LocalizedField } from "@/lib/sanity/i18n";

type HeroData = {
  heroSubtitle?: LocalizedField;
  heroDescription?: LocalizedField;
  heroScrollLabel?: LocalizedField;
} | null;

export default function Hero({ data }: { data?: HeroData } = {}) {
  const { t } = useLang();
  const subtitle = t(data?.heroSubtitle ?? null) || "PickUpWall";
  const description =
    t(data?.heroDescription ?? null) ||
    "Automatyczne systemy odbioru przesylek.\nProjektujemy, produkujemy i wdrazamy.";
  const scrollLabel = t(data?.heroScrollLabel ?? null) || "Scroll down";
  const heroRef = useRef<HTMLElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        imageRef.current,
        { scale: 1.12, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.8,
          ease: "power2.out",
          delay: 0.1,
        },
      )
        .fromTo(
          subtitleRef.current,
          { x: -60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8 },
          "-=1.0",
        )
        .fromTo(
          descRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.5",
        )
        .fromTo(
          scrollRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          "-=0.3",
        );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen min-h-[640px] overflow-hidden bg-[#f0f4f5] flex items-center justify-center">
      <img
        ref={imageRef}
        src="/hero3.jpeg"
        alt="PickUpWall"
        className="absolute inset-0 z-[1] w-full h-full object-cover"
        // Match GSAP's `fromTo` starting state so the server-rendered HTML
        // doesn't flash visible before the timeline boots.
        style={{
          opacity: 0,
          transform: "scale(1.1)",
          objectPosition: "top",
        }}
      />

      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, transparent 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      <div className="absolute top-[20vh] left-[6vw] right-[6vw] z-[3] max-lg:top-[22vh]">
        <p
          ref={subtitleRef}
          className="m-0 mt-2 font-bold tracking-tight"
          style={{
            fontSize: "clamp(2.4rem, 5.5vw, 4.5rem)",
            lineHeight: 1.05,
            color: "#00B4C5",
            textShadow: "0 2px 20px rgba(0,0,0,0.2)",
            opacity: 0,
            transform: "translateX(-60px)",
          }}>
          {subtitle}
        </p>
      </div>

      <div
        ref={descRef}
        className="absolute bottom-[10vh] left-[6vw] right-[6vw] z-[3] max-lg:bottom-[14vh]"
        style={{ opacity: 0, transform: "translateY(30px)" }}>
        <div className="w-10 h-0.5 mb-4" style={{ background: "#00B4C5" }} />
        <h1
          className="text-white/85 m-0 leading-relaxed whitespace-pre-line"
          style={{
            fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
            maxWidth: "560px",
          }}>
          {description}
        </h1>
      </div>
    </section>
  );
}
